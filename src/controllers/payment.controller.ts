import { RequestHandler } from "express";
import {
  TClaimPaymentResponseDto,
  TCompletePaymentResponseDto,
  TFailPaymentBodyDto,
  TFailPaymentResponseDto,
  TGetPaymentParamsDto,
  TGetPaymentResponseDto,
  TRetryPaymentResponseDto,
} from "../dtos/payment.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { AuthenticationError } from "../types/error";
import paymentService from "../services/payment.service";
import { TClaimPaymentCommand, TCompletePaymentCommand, TFailPaymentCommand } from "../types/payment.types";

const getPayment: RequestHandler<TGetPaymentParamsDto, TGetPaymentResponseDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("Invalid user.");
    const paymentId = parseNumberOrThrow(req.params.paymentId, "paymentId");
    const result = await paymentService.getPayment(paymentId, user.companyId, user.id);
    const response: TGetPaymentResponseDto = {
      message: "Payment detail retrieved successfully.",
      data: result,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const claimPayment: RequestHandler<TGetPaymentParamsDto, TClaimPaymentResponseDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("Invalid user.");

    const paymentId = parseNumberOrThrow(req.params.paymentId, "paymentId");
    const command: TClaimPaymentCommand = {
      adminId: user.id,
      companyId: user.companyId,
    };
    const result = await paymentService.claimPayment(paymentId, command);
    const response: TClaimPaymentResponseDto = {
      message: "Payment claimed successfully.",
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const retryPayment: RequestHandler<TGetPaymentParamsDto, TRetryPaymentResponseDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AuthenticationError("Invalid user.");
    }
    const paymentId = parseNumberOrThrow(req.params.paymentId, "paymentId");
    const command: TClaimPaymentCommand = {
      adminId: user.id,
      companyId: user.companyId,
    };

    const result = await paymentService.retryPayment(paymentId, command);

    const response: TRetryPaymentResponseDto = {
      message: "Payment retried successfully.",
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const failPayment: RequestHandler<TGetPaymentParamsDto, TFailPaymentResponseDto, TFailPaymentBodyDto> = async (
  req,
  res,
  next,
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AuthenticationError("Invalid user.");
    }

    const paymentId = parseNumberOrThrow(req.params.paymentId, "paymentId");
    const command: TFailPaymentCommand = {
      adminId: user.id,
      companyId: user.companyId,
      failureReason: req.body.failureReason.trim(),
    };
    const result = await paymentService.failPayment(paymentId, command);
    const response: TFailPaymentResponseDto = {
      message: "Payment marked as failed successfully.",
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const completePayment: RequestHandler<TGetPaymentParamsDto, TCompletePaymentResponseDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AuthenticationError("Invalid user.");
    }

    const paymentId = parseNumberOrThrow(req.params.paymentId, "paymentId");
    const command: TCompletePaymentCommand = {
      adminId: user.id,
      companyId: user.companyId,
      approverName: user.name,
    };
    const result = await paymentService.completePayment(paymentId, command);
    const response: TCompletePaymentResponseDto = {
      message: "Payment completed successfully.",
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  getPayment,
  claimPayment,
  retryPayment,
  failPayment,
  completePayment,
};
