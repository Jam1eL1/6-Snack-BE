import { Company, Order } from "../generated/prisma/client";
import orderRepository from "../repositories/order.repository";
import { NotFoundError, ValidationError, ForbiddenError, BadRequestError, AuthenticationError } from "../types/error";
import {
  TCompanyOrderDetailForAdminResult,
  TCompanyUserOrderDetailStatus,
  TCreateInstantOrderCommand,
  TCreateInstantOrderResult,
  TCreateOrderCommand,
  TCreateOrderResult,
  TGetOrdersQuery,
  TGetOrdersResult,
  TUpdateOrderStatusCommand,
  TUpdateOrderStatusResult,
} from "../types/order.types";
import budgetRepository from "../repositories/budget.repository";
import getDateForBudget from "../utils/getDateForBudget";
import prisma from "../config/prisma";
import productRepository from "../repositories/product.repository";
import userRepository from "../repositories/user.repository";
import { TCancelOrderResponseDto, TGetOrderByIdResponseDto, TGetOrdersByUserIdResponseDto } from "../dtos/order.dto";
import budgetService from "./budget.service";

// Get order history (pending or approved)

type TCompanyUserOrderDetailRecord = NonNullable<Awaited<ReturnType<typeof orderRepository.getOrderById>>>;

// helpers
const addCurrentBudgetToCompanyUserOrderDetail = async (
  formattedOrder: TCompanyOrderDetailForAdminResult,
  companyId: number,
): Promise<TCompanyOrderDetailForAdminResult> => {
  const { year, month } = getDateForBudget();
  const budget = await budgetRepository.getMonthlyBudget({
    companyId,
    year,
    month,
  });
  if (!budget) {
    throw new NotFoundError("Unable to retrieve budget. Please create a budget first.");
  }
  return {
    ...formattedOrder,
    budget: {
      currentMonthBudget: budget.currentMonthBudget,
      currentMonthExpense: budget.currentMonthExpense,
    },
  };
};

// main functions
const getOrders = async (
  { page, limit, orderBy, status }: TGetOrdersQuery,
  companyId: number,
): Promise<TGetOrdersResult> => {
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

const getCompanyUserOrderDetailByStatus = async (
  orderId: Order["id"],
  status: TCompanyUserOrderDetailStatus,
  companyId: Company["id"],
): Promise<TCompanyOrderDetailForAdminResult> => {
  const order = await orderRepository.getOrderByIdAndStatus(orderId, status, companyId);
  if (!order) {
    throw new NotFoundError("Order history not found");
  }

  const formattedOrder = formatCompanyUserOrderDetail(order);

  if (status === "pending") {
    return await addCurrentBudgetToCompanyUserOrderDetail(formattedOrder, companyId);
  }
  return formattedOrder;
};

//
const getCompanyUserOrderDetailById = async (
  orderId: Order["id"],
  companyId: Company["id"],
): Promise<TCompanyOrderDetailForAdminResult> => {
  const order = await orderRepository.getOrderById(orderId);
  if (!order || order.companyId !== companyId) {
    throw new NotFoundError("Order information not found.");
  }

  return formatCompanyUserOrderDetail(order);
};

const formatCompanyUserOrderDetail = (order: TCompanyUserOrderDetailRecord): TCompanyOrderDetailForAdminResult => {
  const { receipts, user, ...rest } = order;
  return {
    ...rest,
    requester: user.name,
    products: receipts,
    budget: { currentMonthBudget: null, currentMonthExpense: null },
  };
};

const formatCreatedCompanyUserOrder = async (
  orderId: Order["id"],
  companyId: Company["id"],
  status: TCompanyUserOrderDetailStatus,
): Promise<TCreateOrderResult> => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order || order.companyId !== companyId) {
    throw new NotFoundError("Created order not found.");
  }

  const formattedOrder = formatCompanyUserOrderDetail(order);

  if (status === "pending") {
    return await addCurrentBudgetToCompanyUserOrderDetail(formattedOrder, companyId);
  }

  return formattedOrder;
};

type TCompleteOrderApprovalCommand = Omit<TUpdateOrderStatusCommand, "status"> & {
  status: "APPROVED" | "INSTANT_APPROVED";
};

const completeOrderApproval = async (
  orderId: Order["id"],
  companyId: Company["id"],
  command: TCompleteOrderApprovalCommand,
): Promise<TUpdateOrderStatusResult> => {
  const { year, month } = getDateForBudget();

  const order = await orderRepository.getOrderById(orderId);

  if (!order) throw new NotFoundError("Order not found.");

  return await prisma.$transaction(async (tx) => {
    const updatedOrder = await orderRepository.updateOrder(orderId, command, tx);
    const { deliveryFee, productsPriceTotal } = updatedOrder;

    // Retrieve budget through service so missing current-month budget is backfilled
    const monthlyBudget = await budgetService.getMonthlyBudget(companyId);

    const { currentMonthExpense } = monthlyBudget;

    // Approval fails when the remaining budget is insufficient
    if (monthlyBudget.currentMonthBudget < currentMonthExpense + productsPriceTotal + deliveryFee)
      throw new BadRequestError("Insufficient budget.");

    const totalCurrentMonthExpense = currentMonthExpense + productsPriceTotal + deliveryFee;

    // Increase current month expense
    await budgetRepository.updateCurrentMonthExpense({ companyId, year, month }, totalCurrentMonthExpense, tx);

    const productIds = order.receipts.map((receipt) => receipt.productId);

    // Increase product sales count
    await productRepository.updateCumulativeSales(productIds, tx);

    return updatedOrder;
  });
};

const getCompanyOrderOrThrow = async (
  orderId: Order["id"],
  companyId: Company["id"],
): Promise<TCompanyUserOrderDetailRecord> => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order || order.companyId !== companyId) {
    throw new NotFoundError("Order not found.");
  }

  return order;
};
// Approve or reject order
const updateOrder = async (
  orderId: Order["id"],
  companyId: Company["id"],
  command: TUpdateOrderStatusCommand,
): Promise<TUpdateOrderStatusResult> => {
  const order = await getCompanyOrderOrThrow(orderId, companyId);
  if (order.status !== "PENDING") {
    throw new BadRequestError("Only pending orders can be approved or rejected.");
  }

  if (command.status === "APPROVED") {
    return completeOrderApproval(orderId, companyId, {
      ...command,
      status: "APPROVED",
    });
  }
  return orderRepository.updateOrder(orderId, command);
};

const completeInstantOrderApproval = async (
  orderId: Order["id"],
  companyId: Company["id"],
  command: Omit<TCompleteOrderApprovalCommand, "status">,
): Promise<TUpdateOrderStatusResult> => {
  const order = await getCompanyOrderOrThrow(orderId, companyId);
  return await completeOrderApproval(orderId, companyId, { ...command, status: "INSTANT_APPROVED" });
};

const createOrder = async (command: TCreateOrderCommand): Promise<TCreateOrderResult> => {
  if (!command.cartItemIds || command.cartItemIds.length === 0) {
    throw new ValidationError("Cart items are required.");
  }

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    return await orderRepository.createOrder(command, tx);
  });

  // Verify user role
  const user = await userRepository.findActiveUserById(command.userId);

  if (!user) throw new AuthenticationError("Login required.");

  const createdOrderStatus: TCompanyUserOrderDetailStatus = user.role === "USER" ? "pending" : "approved";

  return await formatCreatedCompanyUserOrder(order.id, command.companyId, createdOrderStatus);
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

// Instant purchase - admins only
const createInstantOrder = async (command: TCreateInstantOrderCommand): Promise<TCreateInstantOrderResult> => {
  if (!command.cartItemIds || command.cartItemIds.length === 0) {
    throw new ValidationError("Cart items are required.");
  }

  // Create instant purchase order in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const instantOrderData = {
      ...command,
      adminMessage: undefined,
      requestMessage: undefined,
    };

    // Create order
    const order = await orderRepository.createOrder(instantOrderData, tx);

    return order;
  });

  const approvedOrder = await completeInstantOrderApproval(result.id, command.companyId, {
    approver: command.approverName,
    adminMessage: "Auto-approved via instant purchase",
  });

  return approvedOrder;
};

export default {
  getOrders,
  updateOrder,
  completeInstantOrderApproval,
  getCompanyUserOrderDetailById,
  getCompanyUserOrderDetailByStatus,
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
  createInstantOrder,
};
