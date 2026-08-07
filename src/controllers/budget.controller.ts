import { RequestHandler } from "express";
import budgetService from "../services/budget.service";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { TBudgetParamsDto } from "../dtos/budget.dto";
import { TUpdateMonthlyBudgetBody } from "../types/budget.type";
import { AuthenticationError } from "../types/error";

// Get budget and expense overview (ADMIN, SUPER_ADMIN)
const getMonthlyBudget: RequestHandler<TBudgetParamsDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const companyId = parseNumberOrThrow(req.params.companyId, "companyId");
    const budget = await budgetService.getMonthlyBudget(companyId, user.companyId);

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

// Update budget (SUPER_ADMIN)
const updateMonthlyBudget: RequestHandler<TBudgetParamsDto, {}, TUpdateMonthlyBudgetBody> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const companyId = parseNumberOrThrow(req.params.companyId, "companyId");
    const body = req.body;

    const updatedBudget = await budgetService.updateMonthlyBudget(companyId, user.companyId, body);

    res.status(200).json(updatedBudget);
  } catch (error) {
    next(error);
  }
};

export default {
  getMonthlyBudget,
  updateMonthlyBudget,
};
