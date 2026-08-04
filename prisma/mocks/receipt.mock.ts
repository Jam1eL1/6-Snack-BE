export const receiptMockData = [
  // Order 1 Receipts (user-1: Chips Ahoy 2x + Hershey's 3x)
  {
    orderIndex: 1,
    productId: 3,
    productName: "Chips Ahoy! Original Cookies",
    price: 349,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/chips_ahoy.png",
    quantity: 2,
    createdAt: new Date("2026-03-15T10:30:00Z"),
  },
  {
    orderIndex: 1,
    productId: 5,
    productName: "Hershey's Milk Chocolate Bar",
    price: 149,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/hersheys_milk_chocolate.png",
    quantity: 3,
    createdAt: new Date("2026-03-15T10:30:00Z"),
  },

  // Order 2 Receipts (user-2: Coca-Cola 2x + Tropicana 1x)
  {
    orderIndex: 2,
    productId: 9,
    productName: "Coca-Cola Classic 500ml",
    price: 199,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/coca_cola_500ml.png",
    quantity: 2,
    createdAt: new Date("2026-04-01T14:15:00Z"),
  },
  {
    orderIndex: 2,
    productId: 11,
    productName: "Tropicana Orange Juice 500ml",
    price: 279,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/tropicana_orange_juice.png",
    quantity: 1,
    createdAt: new Date("2026-04-01T14:15:00Z"),
  },

  // Order 3 Receipts (user-3: Red Bull 2x + Ramen 3x)
  {
    orderIndex: 3,
    productId: 14,
    productName: "Red Bull Energy Drink",
    price: 379,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/red_bull.png",
    quantity: 2,
    createdAt: new Date("2026-04-07T09:45:00Z"),
  },
  {
    orderIndex: 3,
    productId: 21,
    productName: "Maruchan Chicken Ramen",
    price: 129,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/maruchan_chicken.png",
    quantity: 3,
    createdAt: new Date("2026-04-07T09:45:00Z"),
  },

  // Order 4 Receipts (user-3: Post-it 2x + Pens 5x) - PENDING status
  {
    orderIndex: 4,
    productId: 25,
    productName: "Post-it Super Sticky Notes",
    price: 349,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/post_it_notes.png",
    quantity: 2,
    createdAt: new Date("2026-04-12T11:20:00Z"),
  },
  {
    orderIndex: 4,
    productId: 24,
    productName: "BIC Round Stic Ballpoint Pen",
    price: 99,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/bic_pen.png",
    quantity: 5,
    createdAt: new Date("2026-04-12T11:20:00Z"),
  },

  // Order 5 Receipts (user-1-2: Chips Ahoy 3x + Hershey's 2x)
  {
    orderIndex: 5,
    productId: 3,
    productName: "Chips Ahoy! Original Cookies",
    price: 349,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/chips_ahoy.png",
    quantity: 3,
    createdAt: new Date("2026-04-20T13:10:00Z"),
  },
  {
    orderIndex: 5,
    productId: 5,
    productName: "Hershey's Milk Chocolate Bar",
    price: 149,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/hersheys_milk_chocolate.png",
    quantity: 2,
    createdAt: new Date("2026-04-20T13:10:00Z"),
  },

  // Order 6 Receipts (user-4: Lay's 4x + Pepsi 2x) - PENDING
  {
    orderIndex: 6,
    productId: 1,
    productName: "Lay's Classic Potato Chips",
    price: 249,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/lays_classic.png",
    quantity: 4,
    createdAt: new Date("2026-05-05T09:10:00Z"),
  },
  {
    orderIndex: 6,
    productId: 10,
    productName: "Pepsi 500ml",
    price: 199,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/pepsi_500ml.png",
    quantity: 2,
    createdAt: new Date("2026-05-05T09:10:00Z"),
  },

  // Order 7 Receipts (user-5: Oreo 2x + Mentos 6x) - PENDING
  {
    orderIndex: 7,
    productId: 4,
    productName: "Oreo Double Stuf Cookies",
    price: 399,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/oreo_double_stuf.png",
    quantity: 2,
    createdAt: new Date("2026-05-06T10:20:00Z"),
  },
  {
    orderIndex: 7,
    productId: 8,
    productName: "Mentos Mint Roll",
    price: 129,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/mentos_mint.png",
    quantity: 6,
    createdAt: new Date("2026-05-06T10:20:00Z"),
  },

  // Order 8 Receipts (user-6: Dixie cups 3x + Kleenex 4x) - PENDING
  {
    orderIndex: 8,
    productId: 26,
    productName: "Dixie Paper Cups (50pk)",
    price: 449,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/dixie_paper_cups.png",
    quantity: 3,
    createdAt: new Date("2026-05-07T11:30:00Z"),
  },
  {
    orderIndex: 8,
    productId: 27,
    productName: "Kleenex Facial Tissues (85ct)",
    price: 299,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/kleenex_tissues.png",
    quantity: 4,
    createdAt: new Date("2026-05-07T11:30:00Z"),
  },

  // Order 9 Receipts (user-8: Starbucks espresso 4x + water 12x) - PENDING
  {
    orderIndex: 9,
    productId: 15,
    productName: "Starbucks Doubleshot Espresso",
    price: 349,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/starbucks_doubleshot.png",
    quantity: 4,
    createdAt: new Date("2026-05-08T12:40:00Z"),
  },
  {
    orderIndex: 9,
    productId: 17,
    productName: "Nestle Pure Life Water 500ml",
    price: 119,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/nestle_pure_life.png",
    quantity: 12,
    createdAt: new Date("2026-05-08T12:40:00Z"),
  },

  // Order 10 Receipts (user-4: Monster 2x + Top Ramen 5x) - APPROVED
  {
    orderIndex: 10,
    productId: 13,
    productName: "Monster Energy Original",
    price: 349,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/monster_energy.png",
    quantity: 2,
    createdAt: new Date("2026-05-01T08:15:00Z"),
  },
  {
    orderIndex: 10,
    productId: 22,
    productName: "Nissin Top Ramen Beef",
    price: 139,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/nissin_top_ramen_beef.png",
    quantity: 5,
    createdAt: new Date("2026-05-01T08:15:00Z"),
  },

  // Order 11 Receipts (user-5: Lindt 2x + Perrier 6x) - APPROVED
  {
    orderIndex: 11,
    productId: 6,
    productName: "Lindt 70% Dark Chocolate",
    price: 399,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/lindt_dark_70.png",
    quantity: 2,
    createdAt: new Date("2026-05-02T14:25:00Z"),
  },
  {
    orderIndex: 11,
    productId: 20,
    productName: "Perrier Sparkling Water Lime",
    price: 179,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/perrier_lime.png",
    quantity: 6,
    createdAt: new Date("2026-05-02T14:25:00Z"),
  },

  // Order 12 Receipts (user-6: coffee beans 1x + cups 2x) - REJECTED
  {
    orderIndex: 12,
    productId: 16,
    productName: "Starbucks Medium Roast Whole Beans",
    price: 1799,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/starbucks_medium_roast_whole_beans.png",
    quantity: 1,
    createdAt: new Date("2026-05-03T09:35:00Z"),
  },
  {
    orderIndex: 12,
    productId: 26,
    productName: "Dixie Paper Cups (50pk)",
    price: 449,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/dixie_paper_cups.png",
    quantity: 2,
    createdAt: new Date("2026-05-03T09:35:00Z"),
  },

  // Order 13 Receipts (user-3: cup noodles 6x + LaCroix 6x) - CANCELED
  {
    orderIndex: 13,
    productId: 23,
    productName: "Nissin Cup Noodles Original",
    price: 159,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/nissin_cup_noodles.png",
    quantity: 6,
    createdAt: new Date("2026-05-04T15:45:00Z"),
  },
  {
    orderIndex: 13,
    productId: 19,
    productName: "LaCroix Sparkling Water Lemon",
    price: 149,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/lacroix_lemon.png",
    quantity: 6,
    createdAt: new Date("2026-05-04T15:45:00Z"),
  },

  // Order 14 Receipts (user-9: Coca-Cola 3x + Tropicana 3x) - PENDING
  {
    orderIndex: 14,
    productId: 9,
    productName: "Coca-Cola Classic 500ml",
    price: 199,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/coca_cola_500ml.png",
    quantity: 3,
    createdAt: new Date("2026-05-05T10:05:00Z"),
  },
  {
    orderIndex: 14,
    productId: 11,
    productName: "Tropicana Orange Juice 500ml",
    price: 279,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/tropicana_orange_juice.png",
    quantity: 3,
    createdAt: new Date("2026-05-05T10:05:00Z"),
  },

  // Order 15 Receipts (user-11: Post-it 4x + pens 10x) - PENDING
  {
    orderIndex: 15,
    productId: 25,
    productName: "Post-it Super Sticky Notes",
    price: 349,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/post_it_notes.png",
    quantity: 4,
    createdAt: new Date("2026-05-06T13:15:00Z"),
  },
  {
    orderIndex: 15,
    productId: 24,
    productName: "BIC Round Stic Ballpoint Pen",
    price: 99,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/bic_pen.png",
    quantity: 10,
    createdAt: new Date("2026-05-06T13:15:00Z"),
  },

  // Order 16 Receipts (user-9: Haribo 5x + Aquafina 8x) - APPROVED
  {
    orderIndex: 16,
    productId: 7,
    productName: "Haribo Goldbears Gummy Candy",
    price: 229,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/haribo_goldbears.png",
    quantity: 5,
    createdAt: new Date("2026-05-02T09:45:00Z"),
  },
  {
    orderIndex: 16,
    productId: 18,
    productName: "Aquafina Water 500ml",
    price: 119,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/aquafina_500ml.png",
    quantity: 8,
    createdAt: new Date("2026-05-02T09:45:00Z"),
  },

  // Order 17 Receipts (user-10: Doritos 4x + Red Bull 2x) - INSTANT_APPROVED
  {
    orderIndex: 17,
    productId: 2,
    productName: "Doritos Nacho Cheese",
    price: 299,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/doritos_nacho_cheese.png",
    quantity: 4,
    createdAt: new Date("2026-05-01T11:55:00Z"),
  },
  {
    orderIndex: 17,
    productId: 14,
    productName: "Red Bull Energy Drink",
    price: 379,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/red_bull.png",
    quantity: 2,
    createdAt: new Date("2026-05-01T11:55:00Z"),
  },

  // Order 18 Receipts (user-11: Oreo 1x + Hershey's 6x) - REJECTED
  {
    orderIndex: 18,
    productId: 4,
    productName: "Oreo Double Stuf Cookies",
    price: 399,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/oreo_double_stuf.png",
    quantity: 1,
    createdAt: new Date("2026-05-03T16:05:00Z"),
  },
  {
    orderIndex: 18,
    productId: 5,
    productName: "Hershey's Milk Chocolate Bar",
    price: 149,
    imageUrl: "https://snack-s3-production.s3.us-west-2.amazonaws.com/products/v2/hersheys_milk_chocolate.png",
    quantity: 6,
    createdAt: new Date("2026-05-03T16:05:00Z"),
  },
];
