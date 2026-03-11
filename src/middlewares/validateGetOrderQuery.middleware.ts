import { RequestHandler } from "express";
import { BadRequestError } from "../types/error";
import { TGetOrdersQueryDto } from "../dtos/order.dto";

const validateGetOrderQuery: RequestHandler<{}, {}, {}, TGetOrdersQueryDto> = (req, res, next) => {
  const status = req.query.status;

  if (!status) {
    throw new BadRequestError("Please provide status (pending or approved).");
  }

  if (status !== "pending" && status !== "approved") {
    throw new BadRequestError("Please provide a valid status.");
  }

  next();
};

export default validateGetOrderQuery;
