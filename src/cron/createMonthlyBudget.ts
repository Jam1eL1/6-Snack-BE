import prisma from "../config/prisma";
import getDateForBudget from "../utils/getDateForBudget";
import budgetRepository from "../repositories/budget.repository";

const createMonthlyBudget = async () => {
  const companies = await prisma.company.findMany();

  if (!companies || companies.length === 0) {
    return;
  }

  const { year, month, previousMonth } = getDateForBudget();

  const monthlyBudgetData = await Promise.all(
    companies.map(async ({ id }) => {
      const previousMonthlyBudget = await budgetRepository.getMonthlyBudget({
        companyId: id,
        year,
        month: previousMonth,
      });

      return {
        companyId: id,
        currentMonthExpense: 0,
        currentMonthBudget: previousMonthlyBudget?.monthlyBudget ?? 0,
        monthlyBudget: previousMonthlyBudget?.monthlyBudget ?? 0,
        year,
        month,
      };
    }),
  );

  await prisma.monthlyBudget.createMany({
    data: monthlyBudgetData,
    skipDuplicates: false,
  });
};

export default createMonthlyBudget;
