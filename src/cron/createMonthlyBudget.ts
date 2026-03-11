import prisma from "../config/prisma";
import getDateForBudget from "../utils/getDateForBudget";
import budgetRepository from "../repositories/budget.repository";

const createMonthlyBudget = async () => {
  console.log("1. node-cron started successfully!🕑");

  console.log("2. Looking up companies...🔎");
  const companies = await prisma.company.findMany();

  if (!companies || companies.length === 0) {
    console.log("3. No companies found.❌ Skipping MonthlyBudget creation for this month.↩️");
    return;
  }

  console.log("3. Companies are active in the service. Starting MonthlyBudget creation.🎉");
  console.log("4. Preparing data for MonthlyBudget...📦");
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

  console.log("5. Creating MonthlyBudget records...🚚");
  await prisma.monthlyBudget.createMany({
    data: monthlyBudgetData,
    skipDuplicates: false,
  });

  console.log("6. MonthlyBudget records created successfully!✅");
};

export default createMonthlyBudget;
