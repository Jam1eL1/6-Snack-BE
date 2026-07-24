import { Company, Order, Prisma, User } from "../generated/prisma/client";
import prisma from "../config/prisma";
import {
  TCompanyUserOrderDetailStatus,
  TGetOrdersQuery,
  TGetOrdersRepositoryQuery,
  TGetOrderStatus,
} from "../types/order.types";
import { AuthenticationError } from "../types/error";
import { STANDARD_DELIVERY_FEE_CENTS } from "../constants/money.constants";

const SORT_OPTIONS: Record<"latest" | "priceLow" | "priceHigh", Prisma.OrderOrderByWithRelationInput> = {
  latest: { createdAt: "desc" },
  priceLow: { productsPriceTotal: "asc" },
  priceHigh: { productsPriceTotal: "desc" },
};

const STATUS_OPTIONS: TGetOrderStatus = {
  pending: "PENDING",
  approved: ["APPROVED", "INSTANT_APPROVED"],
};

const acquirePaymentClaim = async (
  orderId: Order["id"],
  companyId: Company["id"],
  adminId: User["id"],
  now: Date,
  expiresAt: Date,
  tx: Prisma.TransactionClient,
) => {
  return await tx.order.updateMany({
    where: {
      id: orderId,
      companyId,
      status: "PENDING",
      OR: [{ paymentAssigneeId: null }, { paymentClaimExpiresAt: null }, { paymentClaimExpiresAt: { lte: now } }],
    },
    data: {
      paymentAssigneeId: adminId,
      paymentClaimExpiresAt: expiresAt,
    },
  });
};

const clearPaymentClaim = async (orderId: Order["id"], adminId: User["id"], tx: Prisma.TransactionClient) => {
  return await tx.order.updateMany({
    where: {
      id: orderId,
      paymentAssigneeId: adminId,
    },
    data: {
      paymentAssigneeId: null,
      paymentClaimExpiresAt: null,
    },
  });
};

const getStatusCondition = (status: keyof TGetOrderStatus) => {
  const statusValue = STATUS_OPTIONS[status];
  return Array.isArray(statusValue) ? { status: { in: statusValue } } : { status: statusValue };
};

// Order list search
const getOrders = async ({ offset, limit, orderBy, status }: TGetOrdersRepositoryQuery, companyId: Company["id"]) => {
  const statusOptions = getStatusCondition(status);

  return await prisma.order.findMany({
    where: { ...statusOptions, companyId },
    skip: offset,
    take: limit,
    orderBy: SORT_OPTIONS[orderBy] || SORT_OPTIONS["latest"],
    include: {
      user: { omit: { hashedRefreshToken: true, password: true } },
      receipts: true,
    },
  });
};

// Order list total count search
const getOrdersTotalCount = async ({ status }: Pick<TGetOrdersQuery, "status">, companyId: Company["id"]) => {
  const statusOptions = getStatusCondition(status);

  return await prisma.order.count({
    where: { ...statusOptions, companyId },
  });
};

// Order search (pending or approved)
const getOrderByIdAndStatus = async (
  id: Order["id"],
  status: TCompanyUserOrderDetailStatus,
  companyId: Company["id"],
) => {
  const statusOptions = getStatusCondition(status);

  return await prisma.order.findFirst({
    where: { id, ...statusOptions, companyId },
    include: {
      user: { omit: { hashedRefreshToken: true, password: true } },
      receipts: true,
    },
  });
};

// Order search (single)
const getOrderById = async (id: Order["id"]) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      user: { omit: { hashedRefreshToken: true, password: true } },
      receipts: true,
    },
  });
};

const getOrderWithCartItemIdsById = async (id: Order["id"]) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      receipts: true,
    },
  });
};

const updateOrder = async (
  id: Order["id"],
  updateData: Pick<Order, "approver" | "adminMessage" | "status">,
  tx?: Prisma.TransactionClient,
) => {
  const { approver, adminMessage, status } = updateData;
  const client = tx || prisma;

  return await client.order.update({
    where: { id },
    data: { approver, adminMessage, status },
  });
};

const revertOrder = async (id: Order["id"]) => {
  return await prisma.order.update({
    where: { id },
    data: { adminMessage: null, status: "PENDING", approver: null },
  });
};

const deleteReceiptAndOrder = async (orderId: Order["id"], tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  // 1. Delete receipt
  await client.receipt.deleteMany({
    where: { orderId },
  });

  // 2. Delete order
  await client.order.delete({
    where: { id: orderId },
  });
};

// OrderRequest related features added
const createOrder = async (
  orderData: {
    userId: string;
    companyId: number;
    adminMessage?: string;
    requestMessage?: string;
    cartItemIds: number[];
    status?: Order["status"];
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  // 1. Fetch cart items and create receipts
  const cartItems = await client.cartItem.findMany({
    where: {
      id: { in: orderData.cartItemIds },
    },
    include: {
      product: true,
    },
  });

  if (cartItems.length !== orderData.cartItemIds.length) {
    throw new Error("Some cart items not found.");
  }

  // 2. Calculate total price
  const totalPrice = cartItems.reduce((sum, cartItem) => {
    return sum + cartItem.product.price * cartItem.quantity;
  }, 0);

  // 2-1. Check user role
  const user = await client.user.findUnique({
    where: { id: orderData.userId },
    select: { role: true },
  });

  if (!user) throw new AuthenticationError("Login required.");

  // 3. Create order
  const order = await client.order.create({
    data: {
      userId: orderData.userId,
      companyId: orderData.companyId,
      adminMessage: orderData.adminMessage,
      requestMessage: orderData.requestMessage,
      productsPriceTotal: totalPrice,
      deliveryFee: STANDARD_DELIVERY_FEE_CENTS,
      status: orderData.status ?? (user.role === "USER" ? "PENDING" : "INSTANT_APPROVED"),
    },
  });

  // 4. Create receipt from each cart item
  const receipts = await Promise.all(
    cartItems.map(async (cartItem) => {
      return await client.receipt.create({
        data: {
          productId: cartItem.productId,
          orderId: order.id,
          productName: cartItem.product.name,
          price: cartItem.product.price,
          imageUrl: cartItem.product.imageUrl,
          quantity: cartItem.quantity,
        },
      });
    }),
  );

  // 5. Delete cart items included in order from cart
  await client.cartItem.updateMany({
    where: {
      id: { in: orderData.cartItemIds },
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // 6. Return created order information
  const result = await client.order.findUnique({
    where: { id: order.id },
    include: {
      receipts: {
        select: {
          id: true,
          productName: true,
          price: true,
          imageUrl: true,
          quantity: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error("Created order not found.");
  }

  return result;
};

const getOrdersByUserId = async (userId: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  return await client.order.findMany({
    where: { userId },
    include: {
      receipts: {
        select: {
          id: true,
          productName: true,
          price: true,
          imageUrl: true,
          quantity: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateOrderStatus = async (
  orderId: Order["id"],
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED",
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  try {
    const updatedOrder = await client.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        receipts: {
          select: {
            id: true,
            productName: true,
            price: true,
            imageUrl: true,
            quantity: true,
          },
        },
      },
    });

    return updatedOrder;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new Error(`Order with ID ${orderId} not found.`);
    }
    throw error;
  }
};

const getOrderForPaymentStart = async (orderId: Order["id"], tx: Prisma.TransactionClient) => {
  return await tx.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      companyId: true,
      status: true,
      productsPriceTotal: true,
      deliveryFee: true,
      paymentAssigneeId: true,
      paymentClaimExpiresAt: true,
      payment: {
        select: {
          id: true,
          status: true,
          authorizedPayerId: true,
          amount: true,
        },
      },
    },
  });
};

export default {
  getOrders,
  getOrdersTotalCount,
  getOrderByIdAndStatus,
  getOrderById,
  getOrderWithCartItemIdsById,
  updateOrder,
  revertOrder,
  deleteReceiptAndOrder,
  createOrder,
  getOrdersByUserId,
  updateOrderStatus,
  acquirePaymentClaim,
  clearPaymentClaim,
  getOrderForPaymentStart,
};
