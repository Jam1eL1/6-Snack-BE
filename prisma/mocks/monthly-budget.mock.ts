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
    currentMonthExpense: 1450.0,
    currentMonthBudget: 3000.0,
    monthlyBudget: 3000.0,
    year: "2025",
    month: "01",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-29"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 5700.0,
    currentMonthBudget: 3000.0,
    monthlyBudget: 15000.0,
    year: "2025",
    month: "02",
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-28"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 16.45,
    currentMonthBudget: 2000.0,
    monthlyBudget: 2000.0,
    year: "2026",
    month: "03",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-15"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 28.22,
    currentMonthBudget: 3000.0,
    monthlyBudget: 3000.0,
    year: "2026",
    month: "04",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-07"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 42.65,
    currentMonthBudget: 2000.0,
    monthlyBudget: 2000.0,
    year: "2026",
    month: "05",
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-02"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 0,
    currentMonthBudget: 2000.0,
    monthlyBudget: 2000.0,
    year: "2025",
    month: "09",
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-09-01"),
    deletedAt: null,
  },
  {
    companyId: 1,
    currentMonthExpense: 0,
    currentMonthBudget: 2000.0,
    monthlyBudget: 2000.0,
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
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
    year: "2025",
    month: "01",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
    year: "2025",
    month: "02",
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
    year: "2026",
    month: "03",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 18.45,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
    year: "2026",
    month: "04",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-20"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 50.51,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
    year: "2026",
    month: "05",
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-02"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
    year: "2025",
    month: "09",
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-09-01"),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
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
    currentMonthBudget: 2000.0,
    monthlyBudget: 2000.0,
    year: currentYear,
    month: currentMonth,
    createdAt: new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`),
    updatedAt: new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`),
    deletedAt: null,
  },
  {
    companyId: 2,
    currentMonthExpense: 0,
    currentMonthBudget: 1500.0,
    monthlyBudget: 1500.0,
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
