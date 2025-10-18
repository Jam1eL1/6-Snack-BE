export const receiptMockData = [
  // Order 1 Receipts (user-1: Chips Ahoy 2x + Hershey's 3x)
  {
    productId: 3,
    productName: "Chips Ahoy! Original Cookies",
    price: 3.49,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/chips_ahoy.png",
    quantity: 2,
    createdAt: new Date("2025-06-15T10:30:00Z"),
  },
  {
    productId: 5,
    productName: "Hershey's Milk Chocolate Bar",
    price: 1.49,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/hersheys_milk_chocolate.png",
    quantity: 3,
    createdAt: new Date("2025-06-15T10:30:00Z"),
  },

  // Order 2 Receipts (user-2: Coca-Cola 2x + Tropicana 1x)
  {
    productId: 9,
    productName: "Coca-Cola Classic 500ml",
    price: 1.99,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/coca_cola_500ml.png",
    quantity: 2,
    createdAt: new Date("2025-07-01T14:15:00Z"),
  },
  {
    productId: 11,
    productName: "Tropicana Orange Juice 500ml",
    price: 2.79,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/tropicana_orange_juice.png",
    quantity: 1,
    createdAt: new Date("2025-07-01T14:15:00Z"),
  },

  // Order 3 Receipts (user-3: Red Bull 2x + Ramen 3x)
  {
    productId: 14,
    productName: "Red Bull Energy Drink",
    price: 3.79,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/red_bull.png",
    quantity: 2,
    createdAt: new Date("2025-07-07T09:45:00Z"),
  },
  {
    productId: 21,
    productName: "Maruchan Chicken Ramen",
    price: 1.29,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/maruchan_chicken.png",
    quantity: 3,
    createdAt: new Date("2025-07-07T09:45:00Z"),
  },

  // Order 4 Receipts (user-3: Post-it 2x + Pens 5x) - PENDING status
  {
    productId: 25,
    productName: "Post-it Super Sticky Notes",
    price: 3.49,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/post_it_notes.png",
    quantity: 2,
    createdAt: new Date("2025-07-12T11:20:00Z"),
  },
  {
    productId: 24,
    productName: "BIC Round Stic Ballpoint Pen",
    price: 0.99,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/bic_pen.png",
    quantity: 5,
    createdAt: new Date("2025-07-12T11:20:00Z"),
  },

  // Order 5 Receipts (user-1-2: Chips Ahoy 3x + Hershey's 2x)
  {
    productId: 3,
    productName: "Chips Ahoy! Original Cookies",
    price: 3.49,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/chips_ahoy.png",
    quantity: 3,
    createdAt: new Date("2025-07-20T13:10:00Z"),
  },
  {
    productId: 5,
    productName: "Hershey's Milk Chocolate Bar",
    price: 1.49,
    imageUrl: "https://snack-s3-bucket-2025.s3.us-west-2.amazonaws.com/products/hersheys_milk_chocolate.png",
    quantity: 2,
    createdAt: new Date("2025-07-20T13:10:00Z"),
  },
];
