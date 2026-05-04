export const cartItemMockData = [
  // user-1 (Alex) - Order 1 items (already purchased)
  {
    userId: "user-1",
    productId: 3, // Chips Ahoy! Original Cookies
    quantity: 2,
    isChecked: true,
    deletedAt: new Date("2026-03-15"),
    createdAt: new Date("2026-03-10T10:00:00Z"),
    updatedAt: new Date("2026-03-15T14:30:00Z"),
  },
  {
    userId: "user-1",
    productId: 5, // Hershey's Milk Chocolate Bar
    quantity: 3,
    isChecked: true,
    deletedAt: new Date("2026-03-15"),
    createdAt: new Date("2026-03-12T09:15:00Z"),
    updatedAt: new Date("2026-03-15T14:30:00Z"),
  },

  // user-2 (Andrew) - Order 2 items (already purchased)
  {
    userId: "user-2",
    productId: 9, // Coca-Cola Classic 500ml
    quantity: 2,
    isChecked: true,
    deletedAt: new Date("2026-04-01"),
    createdAt: new Date("2026-03-20T16:45:00Z"),
    updatedAt: new Date("2026-04-01T11:20:00Z"),
  },
  {
    userId: "user-2",
    productId: 11, // Tropicana Orange Juice 500ml
    quantity: 1,
    isChecked: true,
    deletedAt: new Date("2026-04-01"),
    createdAt: new Date("2026-03-22T13:30:00Z"),
    updatedAt: new Date("2026-04-01T11:20:00Z"),
  },

  // user-3 (Elizabeth) - Order 3 items (already purchased)
  {
    userId: "user-3",
    productId: 14, // Red Bull Energy Drink
    quantity: 2,
    isChecked: true,
    deletedAt: new Date("2026-04-07"),
    createdAt: new Date("2026-03-25T13:30:00Z"),
    updatedAt: new Date("2026-04-07T10:15:00Z"),
  },
  {
    userId: "user-3",
    productId: 21, // Maruchan Chicken Ramen
    quantity: 3,
    isChecked: true,
    deletedAt: new Date("2026-04-07"),
    createdAt: new Date("2026-03-25T13:35:00Z"),
    updatedAt: new Date("2026-04-07T10:15:00Z"),
  },

  // user-1 (Alex) - Active cart items (not yet purchased)
  {
    userId: "user-1",
    productId: 7, // Haribo Goldbears Gummy Candy
    quantity: 2,
    isChecked: true,
    deletedAt: null,
    createdAt: new Date("2026-04-10T08:00:00Z"),
    updatedAt: new Date("2026-04-10T08:00:00Z"),
  },
  {
    userId: "user-1",
    productId: 17, // Nestlé Pure Life Water 500ml
    quantity: 6,
    isChecked: true,
    deletedAt: null,
    createdAt: new Date("2026-04-11T14:30:00Z"),
    updatedAt: new Date("2026-04-11T14:30:00Z"),
  },

  // user-2 (Andrew) - Active cart items
  {
    userId: "user-2",
    productId: 4, // Oreo Double Stuf Cookies
    quantity: 1,
    isChecked: true,
    deletedAt: null,
    createdAt: new Date("2026-04-12T15:20:00Z"),
    updatedAt: new Date("2026-04-12T15:20:00Z"),
  },
  {
    userId: "user-2",
    productId: 15, // Starbucks Doubleshot Espresso
    quantity: 4,
    isChecked: false,
    deletedAt: null,
    createdAt: new Date("2026-04-13T09:00:00Z"),
    updatedAt: new Date("2026-04-13T09:00:00Z"),
  },

  // user-3 (Elizabeth) - Active cart items
  {
    userId: "user-3",
    productId: 8, // Mentos Mint Roll
    quantity: 5,
    isChecked: true,
    deletedAt: null,
    createdAt: new Date("2026-04-14T12:45:00Z"),
    updatedAt: new Date("2026-04-14T12:45:00Z"),
  },
  {
    userId: "user-3",
    productId: 24, // BIC Round Stic Ballpoint Pen
    quantity: 10,
    isChecked: true,
    deletedAt: null,
    createdAt: new Date("2026-04-15T10:20:00Z"),
    updatedAt: new Date("2026-04-15T10:20:00Z"),
  },
];
