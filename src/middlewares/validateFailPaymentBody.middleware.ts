import { RequestHandler } from "express";
import { TFailPaymentBodyDto } from "../dtos/payment.dto";
import { ValidationError } from "../types/error";

const validateFailPaymentBody: RequestHandler<{}, {}, TFailPaymentBodyDto> = (req, res, next) => {
  const { failureReason } = req.body;

  if (typeof failureReason !== "string" || !failureReason.trim()) {
    throw new ValidationError("Please provide a failure reason.");
  }

  next();
};

export default validateFailPaymentBody;
