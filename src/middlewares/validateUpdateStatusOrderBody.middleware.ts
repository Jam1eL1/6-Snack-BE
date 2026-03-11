import { RequestHandler } from "express";
import { TUpdateStatusOrderBodyDto } from "../dtos/order.dto";
import { ValidationError } from "../types/error";

const validateUpdateStatusOrderBody: RequestHandler<{}, {}, TUpdateStatusOrderBodyDto> = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    throw new ValidationError("Please provide a status value.");
  }

  if (status !== "APPROVED" && status !== "REJECTED") {
    throw new ValidationError("Please provide a valid status.");
  }

  next();
};

export default validateUpdateStatusOrderBody;
