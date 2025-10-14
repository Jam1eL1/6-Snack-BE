export const orderMockData = [
  // SAP (companyId: 1) Orders
  {
    companyId: 1,
    userId: "user-1", // Alex (SUPER_ADMIN)
    approver: "Super Admin",
    adminMessage: "Super Admin order automatically approved.",
    requestMessage: "",
    deliveryFee: 5.0,
    productsPriceTotal: 11.45, // Chips Ahoy 2x ($3.49) + Hershey's 3x ($1.49) = $11.45
    status: "INSTANT_APPROVED",
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2025-06-15"),
  },
  {
    companyId: 1,
    userId: "user-2", // Andrew (ADMIN)
    approver: "Admin",
    adminMessage: "Admin order automatically approved.",
    requestMessage: "",
    deliveryFee: 5.0,
    productsPriceTotal: 6.77, // Coca-Cola 2x ($1.99) + Tropicana 1x ($2.79) = $6.77
    status: "INSTANT_APPROVED",
    createdAt: new Date("2025-07-01"),
    updatedAt: new Date("2025-07-01"),
  },
  {
    companyId: 1,
    userId: "user-3", // Elizabeth (USER)
    approver: "Admin",
    adminMessage: "Requested order approved.",
    requestMessage: "Please approve those items.",
    deliveryFee: 5.0,
    productsPriceTotal: 11.45, // Red Bull 2x ($3.79) + Ramen 3x ($1.29) = $11.45
    status: "APPROVED",
    createdAt: new Date("2025-07-07"),
    updatedAt: new Date("2025-07-07"),
  },
  {
    companyId: 1,
    userId: "user-3", // Elizabeth (USER)
    adminMessage: null,
    requestMessage: "Office supplies needed for Q3 planning.",
    deliveryFee: 5.0,
    productsPriceTotal: 11.93, // Post-it 2x ($3.49) + Pens 5x ($0.99) = $11.93
    status: "PENDING",
    createdAt: new Date("2025-07-12"),
    updatedAt: new Date("2025-07-12"),
  },

  // RBC (companyId: 2) Orders
  {
    companyId: 2,
    userId: "user-1-2", // Jamie (SUPER_ADMIN)
    approver: "Super Admin",
    adminMessage: "Super Admin order automatically approved.",
    requestMessage: "",
    deliveryFee: 5.0,
    productsPriceTotal: 13.45, // Chips Ahoy 3x ($3.49) + Hershey's 2x ($1.49) = $13.45
    status: "INSTANT_APPROVED",
    createdAt: new Date("2025-07-20"),
    updatedAt: new Date("2025-07-20"),
  },
];
