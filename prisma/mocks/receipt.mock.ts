import { productMockData } from "./product.mock";

const receiptOrderMockData = [
  { orderIndex: 1, createdAt: "2026-03-15T10:30:00Z", items: [{ productId: 3, quantity: 2 }, { productId: 5, quantity: 3 }] },
  { orderIndex: 2, createdAt: "2026-04-01T14:15:00Z", items: [{ productId: 9, quantity: 2 }, { productId: 11, quantity: 1 }] },
  { orderIndex: 3, createdAt: "2026-04-07T09:45:00Z", items: [{ productId: 14, quantity: 2 }, { productId: 21, quantity: 3 }] },
  { orderIndex: 4, createdAt: "2026-04-12T11:20:00Z", items: [{ productId: 25, quantity: 2 }, { productId: 24, quantity: 5 }] },
  { orderIndex: 5, createdAt: "2026-04-20T13:10:00Z", items: [{ productId: 3, quantity: 3 }, { productId: 5, quantity: 2 }] },
  { orderIndex: 6, createdAt: "2026-05-05T09:10:00Z", items: [{ productId: 1, quantity: 4 }, { productId: 10, quantity: 2 }] },
  { orderIndex: 7, createdAt: "2026-05-06T10:20:00Z", items: [{ productId: 4, quantity: 2 }, { productId: 8, quantity: 6 }] },
  { orderIndex: 8, createdAt: "2026-05-07T11:30:00Z", items: [{ productId: 26, quantity: 3 }, { productId: 27, quantity: 4 }] },
  { orderIndex: 9, createdAt: "2026-05-08T12:40:00Z", items: [{ productId: 15, quantity: 4 }, { productId: 17, quantity: 12 }] },
  { orderIndex: 10, createdAt: "2026-05-01T08:15:00Z", items: [{ productId: 13, quantity: 2 }, { productId: 22, quantity: 5 }] },
  { orderIndex: 11, createdAt: "2026-05-02T14:25:00Z", items: [{ productId: 6, quantity: 2 }, { productId: 20, quantity: 6 }] },
  { orderIndex: 12, createdAt: "2026-05-03T09:35:00Z", items: [{ productId: 16, quantity: 1 }, { productId: 26, quantity: 2 }] },
  { orderIndex: 13, createdAt: "2026-05-04T15:45:00Z", items: [{ productId: 23, quantity: 6 }, { productId: 19, quantity: 6 }] },
  { orderIndex: 14, createdAt: "2026-05-05T10:05:00Z", items: [{ productId: 9, quantity: 3 }, { productId: 11, quantity: 3 }] },
  { orderIndex: 15, createdAt: "2026-05-06T13:15:00Z", items: [{ productId: 25, quantity: 4 }, { productId: 24, quantity: 10 }] },
  { orderIndex: 16, createdAt: "2026-05-02T09:45:00Z", items: [{ productId: 7, quantity: 5 }, { productId: 18, quantity: 8 }] },
  { orderIndex: 17, createdAt: "2026-05-01T11:55:00Z", items: [{ productId: 2, quantity: 4 }, { productId: 14, quantity: 2 }] },
  { orderIndex: 18, createdAt: "2026-05-03T16:05:00Z", items: [{ productId: 4, quantity: 1 }, { productId: 5, quantity: 6 }] },
  { orderIndex: 19, createdAt: "2026-06-09T10:00:00Z", items: [{ productId: 1, quantity: 2 }, { productId: 17, quantity: 12 }] },
  { orderIndex: 20, createdAt: "2026-06-18T14:20:00Z", items: [{ productId: 7, quantity: 4 }, { productId: 11, quantity: 3 }] },
  { orderIndex: 21, createdAt: "2026-06-23T09:30:00Z", items: [{ productId: 16, quantity: 1 }, { productId: 15, quantity: 2 }] },
  { orderIndex: 22, createdAt: "2026-06-12T11:15:00Z", items: [{ productId: 26, quantity: 2 }, { productId: 27, quantity: 3 }] },
  { orderIndex: 23, createdAt: "2026-06-21T13:40:00Z", items: [{ productId: 2, quantity: 3 }, { productId: 10, quantity: 6 }] },
  { orderIndex: 24, createdAt: "2026-07-08T09:25:00Z", items: [{ productId: 24, quantity: 12 }, { productId: 25, quantity: 4 }] },
  { orderIndex: 25, createdAt: "2026-07-16T12:35:00Z", items: [{ productId: 3, quantity: 4 }, { productId: 6, quantity: 2 }] },
  { orderIndex: 26, createdAt: "2026-07-22T10:45:00Z", items: [{ productId: 13, quantity: 3 }, { productId: 14, quantity: 2 }] },
  { orderIndex: 27, createdAt: "2026-07-14T15:20:00Z", items: [{ productId: 19, quantity: 8 }, { productId: 20, quantity: 6 }] },
  { orderIndex: 28, createdAt: "2026-07-24T11:30:00Z", items: [{ productId: 4, quantity: 3 }, { productId: 5, quantity: 8 }] },
];

export const receiptMockData = receiptOrderMockData.flatMap(({ orderIndex, createdAt, items }) =>
  items.map(({ productId, quantity }) => {
    const product = productMockData[productId - 1];

    if (!product) {
      throw new Error(`Product mock data not found for receipt product ID ${productId}.`);
    }

    return {
      orderIndex,
      productId,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      createdAt: new Date(createdAt),
    };
  }),
);
