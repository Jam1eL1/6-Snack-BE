import { RequestHandler } from "express";
import orderService from "../services/order.service";
import {
  TCreateInstantOrderBodyDto,
  TCreateInstantOrderResponseDto,
  TCreateOrderBodyDto,
  TCreateOrderResponseDto,
  TCancelOrderBodyDto,
  TGetOrderParamsDto,
  TGetOrderQueryDto,
  TGetOrdersQueryDto,
  TUpdateStatusOrderBodyDto,
  TUpdateOrderStatusResponseDto,
  TGetOrdersResponseDto,
  TGetOrderResponseDto,
} from "../dtos/order.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { AuthenticationError } from "../types/error";
import {
  TCreateInstantOrderCommand,
  TCreateOrderCommand,
  TGetOrdersQuery,
  TUpdateOrderStatusCommand,
} from "../types/order.types";

// Get order history (pending or approved)
const getOrders: RequestHandler<{}, TGetOrdersResponseDto, {}, TGetOrdersQueryDto> = async (req, res, next) => {
  try {
    const page = parseNumberOrThrow(req.query.page ?? "1", "page");
    const limit = parseNumberOrThrow(req.query.limit ?? "4", "limit");
    const { orderBy, status } = req.query;
    const user = req.user;

    if (!user) throw new AuthenticationError("Invalid user.");

    const query: TGetOrdersQuery = {
      page,
      limit,
      orderBy,
      status,
    };

    const result = await orderService.getOrders(query, user.companyId);
    const response: TGetOrdersResponseDto = {
      message: "Orders retrieved successfully.",
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get order details (pending or approved)
const getOrder: RequestHandler<TGetOrderParamsDto, TGetOrderResponseDto, {}, TGetOrderQueryDto> = async (
  req,
  res,
  next,
) => {
  try {
    const orderId = req.params.orderId;
    const user = req.user;

    if (!user) throw new AuthenticationError("Invalid user.");

    const { status } = req.query;

    const result = status
      ? await orderService.getCompanyUserOrderDetailByStatus(orderId, status, user.companyId)
      : await orderService.getCompanyUserOrderDetailById(orderId, user.companyId);
    const response: TGetOrderResponseDto = {
      message: "Order details retrieved successfully.",
      data: result,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Approve or reject order
const updateOrder: RequestHandler<
  TGetOrderParamsDto,
  TUpdateOrderStatusResponseDto,
  TUpdateStatusOrderBodyDto
> = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) throw new AuthenticationError("Invalid user.");

    const orderId = req.params.orderId;
    const command: TUpdateOrderStatusCommand = {
      approver: user.name,
      adminMessage: req.body.adminMessage ?? null,
      status: req.body.status,
    };

    const result = await orderService.updateOrder(orderId, user.companyId, command);

    const response: TUpdateOrderStatusResponseDto = {
      message: "Order status updated",
      data: result,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getOrderById: RequestHandler<TGetOrderParamsDto> = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.getOrderById(orderId, req.user.id);

    res.status(200).json(result);
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

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const cancelOrder: RequestHandler<TGetOrderParamsDto, {}, TCancelOrderBodyDto> = async (req, res, next) => {
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

const createOrder: RequestHandler<{}, {}, TCreateOrderBodyDto> = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const command: TCreateOrderCommand = {
      userId: user.id,
      companyId: user.companyId,
      adminMessage: req.body.adminMessage,
      requestMessage: req.body.requestMessage,
      cartItemIds: req.body.cartItemIds,
    };

    const order = await orderService.createOrder(command);
    const response: TCreateOrderResponseDto = order;

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const createInstantOrder: RequestHandler<{}, {}, TCreateInstantOrderBodyDto> = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const command: TCreateInstantOrderCommand = {
      userId: user.id,
      companyId: user.companyId,
      cartItemIds: req.body.cartItemIds,
      approverName: user.name,
    };

    const instantOrder = await orderService.createInstantOrder(command);
    const response: TCreateInstantOrderResponseDto = {
      message: "Instant purchase completed successfully.",
      data: instantOrder,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  getOrders,
  getOrder,
  updateOrder,
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
  createInstantOrder,
};
