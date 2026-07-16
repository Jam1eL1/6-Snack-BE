const getVancouverYearMonth = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";

  return { year, month };
};

const { year: currentYear, month: currentMonth } = getVancouverYearMonth();

const baseMonthlyBudgetMockData = [
  // SAP (Company 1)
  {
    companyId: 1,
    currentMonthExpense: 145000,
    currentMonthBudget: 300000,
    monthlyBudget: 300000,
    year: "2025",
    month: "01",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-29"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 570000,
    currentMonthBudget: 300000,
    monthlyBudget: 1500000,
    year: "2025",
    month: "02",
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-28"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 1645,
    currentMonthBudget: 200000,
    monthlyBudget: 200000,
    year: "2026",
    month: "03",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-15"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 2822,
    currentMonthBudget: 300000,
    monthlyBudget: 300000,
    year: "2026",
    month: "04",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-07"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 4265,
    currentMonthBudget: 200000,
    monthlyBudget: 200000,
    year: "2026",
    month: "05",
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-02"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 0,
    currentMonthBudget: 200000,
    monthlyBudget: 200000,
    year: "2025",
    month: "09",
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-09-01"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 0,
    currentMonthBudget: 200000,
    monthlyBudget: 200000,
    year: "2025",
    month: "10",
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-01"),
    deletedAt: null,
  },
  // RBC (Company 2)
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2025",
    month: "01",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2025",
    month: "02",
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2026",
    month: "03",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 1845,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2026",
    month: "04",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-20"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 5051,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2026",
    month: "05",
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-02"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2025",
    month: "09",
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-09-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2025",
    month: "10",
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-01"),
    deletedAt: null,
  },
];

const currentMonthBudgetDefaults = [
  {
    companyId: 1,
    currentMonthExpense: 0,
    currentMonthBudget: 200000,
    monthlyBudget: 200000,
    year: currentYear,
    month: currentMonth,
    createdAt: new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`),
    updatedAt: new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: currentYear,
    month: currentMonth,
    createdAt: new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`),
    updatedAt: new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`),
    deletedAt: null,
  },
];

export const monthlyBudgetMockData = [
  ...baseMonthlyBudgetMockData,
  ...currentMonthBudgetDefaults.filter(
    (target) =>
      !baseMonthlyBudgetMockData.some(
        (existing) =>
          existing.companyId === target.companyId && existing.year === target.year && existing.month === target.month,
      ),
  ),
];
