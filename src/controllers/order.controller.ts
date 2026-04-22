import { RequestHandler } from "express";
import orderService from "../services/order.service";
import {
  TCancelOrderBodyDto,
  TCancelOrderResponseDto,
  TGetOrderParamsDto,
  TGetOrderQueryDto,
  TGetOrdersQueryDto,
  TUpdateStatusOrderBodyDto,
} from "../dtos/order.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { AuthenticationError } from "../types/error";



// Get order history (pending or approved)
const getOrders: RequestHandler<{}, {}, {}, TGetOrdersQueryDto> = async (req, res, next) => {
  const page = parseNumberOrThrow(req.query.page ?? "1", "page");
  const limit = parseNumberOrThrow(req.query.limit ?? "4", "limit");
  const { orderBy, status } = req.query;
  const user = req.user;

  if (!user) throw new AuthenticationError("Invalid user.");

  const companyId = user.companyId;

  const orderList = await orderService.getOrders({ page, limit, orderBy, status }, companyId);

  res.status(200).json(orderList);
};


// Get order details (pending or approved)
const getOrder: RequestHandler<TGetOrderParamsDto, {}, {}, TGetOrderQueryDto> = async (req, res, next) => {
  const orderId = req.params.orderId;
  const user = req.user;

  if (!user) throw new AuthenticationError("Invalid user.");

  const { status } = req.query;
  const order = await orderService.getCompanyOrderDetailForAdmin(orderId, status, user.companyId);

  res.status(200).json(order);
};


// Approve or reject order
const updateOrder: RequestHandler<TGetOrderParamsDto, {}, TUpdateStatusOrderBodyDto> = async (req, res, next) => {
  const user = req.user;

  if (!user) throw new AuthenticationError("Invalid user.");

  const approver = user.name;
  const companyId = user.companyId;
  const orderId = req.params.orderId;
  const { adminMessage = "", status } = req.body;

  const updatedOrder = await orderService.updateOrder(orderId, companyId, { approver, adminMessage, status });

  res.status(200).json(updatedOrder);
};

// Order request features
const createOrder: RequestHandler<
  {},
  {},
  { adminMessage?: string; requestMessage?: string; cartItemIds: number[] }
> = async (req, res, next) => {
  try {
    const orderData = req.body;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    // Use authenticated user ID
    const authenticatedOrderData = {
      ...orderData,
      userId: req.user.id,
      companyId: req.user.companyId,
    };

    const order = await orderService.createOrder(authenticatedOrderData);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrderById: RequestHandler<{ orderId: string }> = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.getOrderById(orderId, req.user.id);

    res.status(200).json({
      message: "Purchase request retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOrdersByUserId: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.getOrdersByUserId(req.user.id);

    res.status(200).json({
      message: "My purchase request list retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder: RequestHandler<TGetOrderParamsDto, TCancelOrderResponseDto, TCancelOrderBodyDto> = async (
  req,
  res,
  next,
) => {
  try {
    const orderId = req.params.orderId;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.cancelOrder(orderId, req.user.id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createInstantOrder: RequestHandler<{}, {}, { cartItemIds: number[] }> = async (req, res, next) => {
  try {
    const orderData = req.body;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    // Use authenticated user ID (without message fields)
    const authenticatedOrderData = {
      cartItemIds: orderData.cartItemIds,
      userId: req.user.id,
      companyId: req.user.companyId,
    };

    // 1. Create order
    const result = await orderService.createInstantOrder(authenticatedOrderData);

    // 2. Approve via orderService
    const approvedOrder = await orderService.updateOrder(result.id, req.user.companyId, {
      approver: req.user.name || "System",
      adminMessage: "Auto-approved via instant purchase",
      status: "APPROVED",
    });

    res.status(201).json({
      message: "Instant purchase completed successfully.",
      data: approvedOrder,
    });
  } catch (error) {
    next(error);
  }
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
