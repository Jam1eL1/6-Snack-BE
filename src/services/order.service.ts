import { Company, Order } from "../generated/prisma/client";
import orderRepository from "../repositories/order.repository";
import { NotFoundError, ValidationError, ForbiddenError, BadRequestError, AuthenticationError } from "../types/error";
import { TGetOrdersQuery } from "../types/order.types";
import budgetRepository from "../repositories/budget.repository";
import getDateForBudget from "../utils/getDateForBudget";
import prisma from "../config/prisma";
import productRepository from "../repositories/product.repository";
import userRepository from "../repositories/user.repository";
import {
  TCancelOrderResponseDto,
  TCreateInstantOrderResponseDto,
  TCompanyOrderDetailForAdminResponseDto,
  TGetOrderByIdResponseDto,
  TGetOrdersByUserIdResponseDto,
  TGetOrdersResponseDto,
  TUpdateOrderResponseDto,
} from "../dtos/order.dto";

// Get order history (pending or approved)
const getOrders = async (
  { page, limit, orderBy, status }: TGetOrdersQuery,
  companyId: number,
): Promise<TGetOrdersResponseDto> => {
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

// Get company order details for admin users (pending, approved, or without status filter)
const getCompanyOrderDetailForAdmin = async (
  orderId: Order["id"],
  status: "pending" | "approved" | undefined,
  companyId: number,
): Promise<TCompanyOrderDetailForAdminResponseDto> => {
  const order = status
    ? await orderRepository.getOrderByIdAndStatus(orderId, status, companyId)
    : await orderRepository.getOrderById(orderId);

  if (!order || order.companyId !== companyId) {
    throw new NotFoundError(status ? "Order history not found." : "Order information not found.");
  }

  const { receipts, user, ...rest } = order;

  const formattedOrder: TCompanyOrderDetailForAdminResponseDto = {
    ...rest,
    requester: user.name,
    products: receipts,
    budget: { currentMonthBudget: null, currentMonthExpense: null },
  };

  if (status === "pending") {
    const { year, month } = getDateForBudget();

    const budget = await budgetRepository.getMonthlyBudget({ companyId, year, month });

    if (!budget) {
      throw new NotFoundError("Unable to retrieve budget. Please create a budget first.");
    }

    const { currentMonthBudget, currentMonthExpense } = budget;

    return {
      ...formattedOrder,
      budget: { currentMonthBudget, currentMonthExpense },
    };
  }

  return formattedOrder;
};

// Approve or reject order
const updateOrder = async (
  orderId: Order["id"],
  companyId: Company["id"],
  body: Pick<Order, "approver" | "adminMessage" | "status">,
): Promise<TUpdateOrderResponseDto> => {
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
}): Promise<TCompanyOrderDetailForAdminResponseDto> => {
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

  const formattedOrder = await getCompanyOrderDetailForAdmin(
    order.id,
    user.role === "USER" ? "pending" : "approved",
    orderData.companyId,
  );

  return formattedOrder;
};

const getOrderById = async (orderId: string, userId: string): Promise<TGetOrderByIdResponseDto> => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found.");
  }

  if (order.userId !== userId) {
    throw new ForbiddenError("You do not have permission to access this order.");
  }

  return {
    message: "Purchase request retrieved successfully.",
    data: order,
  };
};

const getOrdersByUserId = async (userId: string): Promise<TGetOrdersByUserIdResponseDto> => {
  const orders = await orderRepository.getOrdersByUserId(userId);

  return {
    message: "My purchase request list retrieved successfully.",
    data: orders,
  };
};

const cancelOrder = async (orderId: string, userId: string): Promise<TCancelOrderResponseDto> => {
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

  const canceledOrder = await orderRepository.updateOrderStatus(orderId, "CANCELED");

  return {
    message: "Purchase request canceled successfully.",
    data: {
      ...canceledOrder,
      status: "CANCELED",
    },
  };
};

// Instant purchase
const createInstantOrder = async (
  orderData: { userId: string; cartItemIds: number[]; companyId: number; approverName: string },
): Promise<TCreateInstantOrderResponseDto> => {
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

  const approvedOrder = await updateOrder(result.id, orderData.companyId, {
    approver: orderData.approverName,
    adminMessage: "Auto-approved via instant purchase",
    status: "APPROVED",
  });

  return {
    message: "Instant purchase completed successfully.",
    data: approvedOrder,
  };
};

export default {
  getOrders,
  getCompanyOrderDetailForAdmin,
  updateOrder,
  // Order request features
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
  createInstantOrder,
};
