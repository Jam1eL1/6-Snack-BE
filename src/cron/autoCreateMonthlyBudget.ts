// src/jobs/autoCreateMonthlyBudget.ts

import cron from "node-cron";
import createMonthlyBudget from "./createMonthlyBudget";

const autoCreateMonthlyBudget = cron.schedule(
  "0 0 0 1 * *",
  async () => {
    try {
      await createMonthlyBudget();
    } catch (e) {
      if (e instanceof Error) {
        console.error("⚠️An error occurred while creating MonthlyBudget.⚠️");
        console.error(e.message);
      }
    }
  },
  { timezone: "America/Vancouver" },
);

export default autoCreateMonthlyBudget;
