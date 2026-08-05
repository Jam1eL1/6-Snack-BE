export const monthlyBudgetMockData = [
  // SAP (Company 1)
  ...[
    { month: "01", expense: 0, updatedAt: "2026-01-01" },
    { month: "02", expense: 0, updatedAt: "2026-02-01" },
    { month: "03", expense: 1645, updatedAt: "2026-03-15" },
    { month: "04", expense: 2822, updatedAt: "2026-04-07" },
    { month: "05", expense: 4265, updatedAt: "2026-05-02" },
    { month: "06", expense: 2253, updatedAt: "2026-06-18" },
    { month: "07", expense: 4999, updatedAt: "2026-07-22" },
  ].map(({ month, expense, updatedAt }) => ({
    companyId: 1,
    currentMonthExpense: expense,
    currentMonthBudget: 200000,
    monthlyBudget: 200000,
    year: "2026",
    month,
    createdAt: new Date(`2026-${month}-01T00:00:00.000Z`),
    updatedAt: new Date(`${updatedAt}T00:00:00.000Z`),
    deletedAt: null,
  })),

  // RBC (Company 2)
  ...[
    { month: "01", expense: 0, updatedAt: "2026-01-01" },
    { month: "02", expense: 0, updatedAt: "2026-02-01" },
    { month: "03", expense: 0, updatedAt: "2026-03-01" },
    { month: "04", expense: 1845, updatedAt: "2026-04-20" },
    { month: "05", expense: 5051, updatedAt: "2026-05-02" },
    { month: "06", expense: 2591, updatedAt: "2026-06-21" },
    { month: "07", expense: 0, updatedAt: "2026-07-24" },
  ].map(({ month, expense, updatedAt }) => ({
    companyId: 2,
    currentMonthExpense: expense,
    currentMonthBudget: 150000,
    monthlyBudget: 150000,
    year: "2026",
    month,
    createdAt: new Date(`2026-${month}-01T00:00:00.000Z`),
    updatedAt: new Date(`${updatedAt}T00:00:00.000Z`),
    deletedAt: null,
  })),
];
