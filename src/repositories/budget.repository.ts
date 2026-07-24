import { MonthlyBudget, Prisma } from "../generated/prisma/client";
import prisma from "../config/prisma";
import {
  TCreateMonthlyBudgetData,
  TMonthlyBudget,
  TTotalExpense,
  TUpdateMonthlyBudgetBody,
} from "../types/budget.type";

const getMonthlyBudget = async ({ companyId, year, month }: TMonthlyBudget, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  return await client.monthlyBudget.findUnique({
    where: {
      companyId_year_month: { companyId, year, month },
    },
  });
};

const getTotalExpense = async ({ companyId, year }: TTotalExpense) => {
  return await prisma.monthlyBudget.aggregate({
    where: { companyId, year },
    _sum: { currentMonthExpense: true },
  });
};

const createMonthlyBudget = async (data: TCreateMonthlyBudgetData, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  return client.monthlyBudget.create({
    data: {
      companyId: data.companyId,
      year: data.year,
      month: data.month,
      currentMonthExpense: data.currentMonthExpense ?? 0,
      currentMonthBudget: data.currentMonthBudget ?? 0,
      monthlyBudget: data.monthlyBudget ?? 0,
    },
  });
};

const updateMonthlyBudget = async (
  { companyId, year, month }: TMonthlyBudget,
  body: TUpdateMonthlyBudgetBody,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  const { currentMonthBudget = 0, monthlyBudget = 0 } = body;

  return await client.monthlyBudget.update({
    where: { companyId_year_month: { companyId, year, month } },
    data: { currentMonthBudget, monthlyBudget },
  });
};

const upsertMonthlyBudget = async (data: TCreateMonthlyBudgetData, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  return client.monthlyBudget.upsert({
    where: {
      companyId_year_month: {
        companyId: data.companyId,
        year: data.year,
        month: data.month,
      },
    },
    update: {},
    create: {
      companyId: data.companyId,
      year: data.year,
      month: data.month,
      currentMonthExpense: data.currentMonthExpense ?? 0,
      currentMonthBudget: data.currentMonthBudget ?? 0,
      monthlyBudget: data.monthlyBudget ?? 0,
    },
  });
};

const updateCurrentMonthExpense = async (
  { companyId, year, month }: TMonthlyBudget,
  currentMonthExpense: MonthlyBudget["currentMonthExpense"],
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return await client.monthlyBudget.update({
    where: { companyId_year_month: { companyId, year, month } },
    data: { currentMonthExpense },
  });
};

const incrementCurrentMonthExpense = async (
  budgetId: MonthlyBudget["id"],
  expectedCurrentMonthExpense: MonthlyBudget["currentMonthExpense"],
  amount: number,
  tx: Prisma.TransactionClient,
) => {
  return await tx.monthlyBudget.updateMany({
    where: {
      id: budgetId,
      currentMonthExpense: expectedCurrentMonthExpense,
      currentMonthBudget: {
        gte: expectedCurrentMonthExpense + amount,
      },
    },
    data: {
      currentMonthExpense: {
        increment: amount,
      },
    },
  });
};

export default {
  getMonthlyBudget,
  getTotalExpense,
  createMonthlyBudget,
  updateMonthlyBudget,
  updateCurrentMonthExpense,
  incrementCurrentMonthExpense,
  upsertMonthlyBudget,
};
