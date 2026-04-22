import { RequestHandler } from "express";
import budgetService from "../services/budget.service";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { TBudgetParamsDto } from "../dtos/budget.dto";
import { TUpdateMonthlyBudgetBody } from "../types/budget.type";



// Get budget and expense overview (ADMIN, SUPER_ADMIN)
const getMonthlyBudget: RequestHandler<TBudgetParamsDto> = async (req, res, next) => {
  const companyId = parseNumberOrThrow(req.params.companyId, "companyId");
  const budget = await budgetService.getMonthlyBudget(companyId);

  res.status(200).json(budget);
};


// Update budget (SUPER_ADMIN)
const updateMonthlyBudget: RequestHandler<TBudgetParamsDto, {}, TUpdateMonthlyBudgetBody> = async (req, res, next) => {
  const companyId = parseNumberOrThrow(req.params.companyId, "companyId");
  const body = req.body;

  const updatedBudget = await budgetService.updateMonthlyBudget(companyId, body);

  res.status(200).json(updatedBudget);
};

export default {
  getMonthlyBudget,
  updateMonthlyBudget,
};
