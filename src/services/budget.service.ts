import { MonthlyBudget } from "../generated/prisma/client";
import budgetRepository from "../repositories/budget.repository";
import { TUpdateMonthlyBudgetBody } from "../types/budget.type";
import getDateForBudget from "../utils/getDateForBudget";
import prisma from "../config/prisma";

// Get budget and expense overview (ADMIN, SUPER_ADMIN)
const getMonthlyBudget = async (companyId: MonthlyBudget["companyId"]) => {
  const { year, month, previousYear, previousMonth, previousMonthYear } = getDateForBudget();

  let currentBudget = await budgetRepository.getMonthlyBudget({ companyId, year, month });
  const previousBudget = await budgetRepository.getMonthlyBudget({
    companyId,
    year: previousMonthYear,
    month: previousMonth,
  });
  if (!currentBudget) {
    const defaultBudgetAmount = previousBudget?.monthlyBudget ?? 0;
    currentBudget = await budgetRepository.upsertMonthlyBudget({
      companyId,
      year,
      month,
      currentMonthExpense: 0,
      currentMonthBudget: defaultBudgetAmount,
      monthlyBudget: defaultBudgetAmount,
    });
  }

  const currentYearTotalExpense = await budgetRepository.getTotalExpense({ companyId, year });
  const previousYearTotalExpense = await budgetRepository.getTotalExpense({ companyId, year: previousYear });

  const BudgetAndExpense = {
    ...currentBudget,
    currentYearTotalExpense: currentYearTotalExpense?._sum.currentMonthExpense ?? 0,
    previousMonthBudget: previousBudget?.currentMonthBudget ?? 0,
    previousMonthExpense: previousBudget?.currentMonthExpense ?? 0,
    previousYearTotalExpense: previousYearTotalExpense?._sum.currentMonthExpense ?? 0,
  };

  return BudgetAndExpense;
};

// Update budget (SUPER_ADMIN)
const updateMonthlyBudget = async (companyId: MonthlyBudget["companyId"], body: TUpdateMonthlyBudgetBody) => {
  const { year, month } = getDateForBudget();

  const monthlyBudget = await budgetRepository.getMonthlyBudget({ companyId, year, month });

  return await prisma.$transaction(async (tx) => {
    if (!monthlyBudget) {
      await budgetRepository.createMonthlyBudget({ companyId, year, month }, tx);

      const updatedMonthlyBudget = await budgetRepository.updateMonthlyBudget({ companyId, year, month }, body, tx);

      return updatedMonthlyBudget;
    }

    const updatedMonthlyBudget = await budgetRepository.updateMonthlyBudget({ companyId, year, month }, body, tx);

    return updatedMonthlyBudget;
  });
};

export default {
  getMonthlyBudget,
  updateMonthlyBudget,
};
