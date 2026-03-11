import { Company, Order } from "../generated/prisma/client";
import orderRepository from "../repositories/order.repository";
import { NotFoundError, ValidationError, ForbiddenError, BadRequestError, AuthenticationError } from "../types/error";
import { TGetOrdersQuery, TOrderWithBudget } from "../types/order.types";
import budgetRepository from "../repositories/budget.repository";
import getDateForBudget from "../utils/getDateForBudget";
import prisma from "../config/prisma";
import productRepository from "../repositories/product.repository";
import userRepository from "../repositories/user.repository";

// Get order history (pending or approved)
const getOrders = async ({ page, limit, orderBy, status }: TGetOrdersQuery, companyId: number) => {
  const offset = (page - 1) * limit;

  const orders = await orderRepository.getOrders({ offset, limit, orderBy, status }, companyId);

  if (!orders) {
    throw new NotFoundError("Order history not found.");
  }

  const totalCount = await orderRepository.getOrdersTotalCount({ status }, companyId);

  const formattedOrders = orders.map(({ user, receipts, ...rest }) => {
    // When there are multiple products in one order
    if (receipts.length >= 2) {
      return {
        ...rest,
        requester: user.name,
        productName: `${receipts[0].productName} and ${receipts.length - 1} more`,
      };
    }

    // When there is only one product in the order
    return { ...rest, requester: user.name, productName: receipts[0].productName };
  });

  return {
    orders: formattedOrders,
    meta: { totalCount, itemsPerPage: limit, totalPages: Math.ceil(totalCount / limit), currentPage: page },
  };
};

// Get order details (pending or approved)
const getOrder = async (orderId: Order["id"], status: "pending" | "approved", companyId: number) => {
  const order = await orderRepository.getOrderByIdAndStatus(orderId, status, companyId);

  if (!order) {
    throw new NotFoundError("Order history not found.");
  }

  const { receipts, ...rest } = order;

  let formattedOrder: TOrderWithBudget = {
    ...rest,
    requester: order.user.name,
    products: order.receipts,
    budget: { currentMonthBudget: null, currentMonthExpense: null },
  };

  if (status === "pending") {
    const { year, month } = getDateForBudget();

    const budget = await budgetRepository.getMonthlyBudget({ companyId, year, month });

    if (!budget) {
      throw new NotFoundError("Unable to retrieve budget. Please create a budget first.");
    }

    const { currentMonthBudget, currentMonthExpense } = budget;

    return (formattedOrder = {
      ...formattedOrder,
      budget: { currentMonthBudget, currentMonthExpense },
    });
  }

  return formattedOrder;
};

// Approve or reject order
const updateOrder = async (
  orderId: Order["id"],
  companyId: Company["id"],
  body: Pick<Order, "approver" | "adminMessage" | "status">,
) => {
  const { year, month } = getDateForBudget();

  // 1. Fetch order
  const order = await orderRepository.getOrderById(orderId);

  if (!order) throw new NotFoundError("Order not found.");

  return await prisma.$transaction(async (tx) => {
    // 2. Update order status (approved or rejected)
    const updatedOrder = await orderRepository.updateOrder(orderId, body, tx);
    const { deliveryFee, productsPriceTotal } = updatedOrder;

    // 2-1. Early return for rejected orders
    if (body.status === "REJECTED") return updatedOrder;

    // 3. Retrieve budget
    const monthlyBudget = await budgetRepository.getMonthlyBudget({ companyId, year, month });

    if (!monthlyBudget) throw new NotFoundError("Budget not found.");

    const { currentMonthExpense } = monthlyBudget;

    // Approval fails when the remaining budget is insufficient
    if (monthlyBudget.currentMonthBudget < currentMonthExpense + productsPriceTotal + deliveryFee)
      throw new BadRequestError("Insufficient budget.");

    const totalCurrentMonthExpense = currentMonthExpense + productsPriceTotal + deliveryFee;

    // 4. Increase current month expense
    await budgetRepository.updateCurrentMonthExpense({ companyId, year, month }, totalCurrentMonthExpense, tx);

    const productIds = order.receipts.map((receipt) => receipt.productId);

    // 5. Increase product sales count
    await productRepository.updateCumulativeSales(productIds, tx);

    return updatedOrder;
  });
};

// Order request features
const createOrder = async (orderData: {
  userId: string;
  companyId: number;
  adminMessage?: string;
  requestMessage?: string;
  cartItemIds: number[];
}) => {
  // Validate input
  if (!orderData.userId) {
    throw new ValidationError("User ID is required.");
  }

  if (!orderData.cartItemIds || orderData.cartItemIds.length === 0) {
    throw new ValidationError("Cart items are required.");
  }

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    return await orderRepository.createOrder(orderData, tx);
  });

  // Verify user role
  const user = await userRepository.findActiveUserById(orderData.userId);

  if (!user) throw new AuthenticationError("Login required.");

  const formattedOrder = getOrder(order.id, user.role === "USER" ? "pending" : "approved", orderData.companyId);

  return formattedOrder;
};

const getOrderById = async (orderId: string, userId: string) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found.");
  }

  if (order.userId !== userId) {
    throw new ForbiddenError("You do not have permission to access this order.");
  }

  return order;
};

const getOrdersByUserId = async (userId: string) => {
  return await orderRepository.getOrdersByUserId(userId);
};

const cancelOrder = async (orderId: string, userId: string) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found.");
  }

  if (order.userId !== userId) {
    throw new ForbiddenError("You do not have permission to access this order.");
  }

  if (order.status !== "PENDING") {
    throw new BadRequestError("Only pending orders can be canceled.");
  }

  return await orderRepository.updateOrderStatus(orderId, "CANCELED");
};

// Instant purchase
const createInstantOrder = async (orderData: { userId: string; cartItemIds: number[]; companyId: number }) => {
  // Validate input
  if (!orderData.userId) {
    throw new ValidationError("User ID is required.");
  }

  if (!orderData.cartItemIds || orderData.cartItemIds.length === 0) {
    throw new ValidationError("Cart items are required.");
  }

  // Create instant purchase order in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const instantOrderData = {
      ...orderData,
      adminMessage: undefined,
      requestMessage: undefined,
    };

    // Create order
    const order = await orderRepository.createOrder(instantOrderData, tx);

    return order;
  });

  return result;
};

export default {
  getOrders,
  getOrder,
  updateOrder,
  // Order request features
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
  createInstantOrder,
};
