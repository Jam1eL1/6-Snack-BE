import { MonthlyBudget } from "../generated/prisma/client";

export type TMonthlyBudget = {
  companyId: MonthlyBudget["companyId"];
  year: MonthlyBudget["year"];
  month: MonthlyBudget["month"];
};

export type TTotalExpense = {
  companyId: MonthlyBudget["companyId"];
  year: MonthlyBudget["year"];
};

export type TUpdateMonthlyBudgetBody = {
  currentMonthBudget: MonthlyBudget["currentMonthBudget"];
  monthlyBudget: MonthlyBudget["monthlyBudget"];
};

export type TCreateMonthlyBudgetData = {
  companyId: MonthlyBudget["companyId"];
  year: MonthlyBudget["year"];
  month: MonthlyBudget["month"];
  currentMonthExpense?: MonthlyBudget["currentMonthExpense"];
  currentMonthBudget?: MonthlyBudget["currentMonthBudget"];
  monthlyBudget?: MonthlyBudget["monthlyBudget"];
};
