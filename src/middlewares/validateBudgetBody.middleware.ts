import { RequestHandler } from "express";
import { TUpdateMonthlyBudgetBody } from "../types/budget.type";
import { ValidationError } from "../types/error";

const validateBudgetBody: RequestHandler<{}, {}, TUpdateMonthlyBudgetBody> = (req, res, next) => {
  const { currentMonthBudget, monthlyBudget } = req.body;

  if (!Number.isFinite(currentMonthBudget) || !Number.isFinite(monthlyBudget)) {
    throw new ValidationError("Current month budget and monthly budget must be numbers.");
  }

  if (currentMonthBudget < 0 || monthlyBudget < 0) {
    throw new ValidationError("Budget values must be 0 or higher.");
  }

  next();
};

export default validateBudgetBody;
