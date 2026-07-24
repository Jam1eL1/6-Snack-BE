import { RequestHandler } from "express";
import { TGetPaymentParamsDto, TGetPaymentResponseDto } from "../dtos/payment.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { AuthenticationError } from "../types/error";
import paymentService from "../services/payment.service";

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

export default {
  getPayment,
};
