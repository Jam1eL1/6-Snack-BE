import { CartItem, Company, Order, Payment, User } from "../generated/prisma/client";

export type TGetOrdersItemResult = {
  id: string;
  companyId: number;
  userId: string;
  approver: string | null;
  adminMessage: string | null;
  requestMessage: string | null;
  deliveryFee: number;
  productsPriceTotal: number;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  requester: string;
  productName: string;
};

export type TGetOrdersResult = {
  orders: TGetOrdersItemResult[];
  meta: {
    totalCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};
export type TCompanyUserOrderDetailStatus = "pending" | "approved";

export type TOrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "INSTANT_APPROVED";

export type TGetOrdersQuery = {
  page: number;
  limit: number;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status: TCompanyUserOrderDetailStatus;
};

export type TGetOrdersRepositoryQuery = {
  offset: number;
  limit: number;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status: TCompanyUserOrderDetailStatus;
};

export type TGetOrderStatus = {
  pending: "PENDING";
  approved: ["APPROVED", "INSTANT_APPROVED"];
};

export type TUpdateOrderStatusCommand = {
  approver: string;
  adminMessage: string | null;
  status: "APPROVED" | "REJECTED";
};

export type TCreateOrderCommand = {
  userId: User["id"];
  companyId: Company["id"];
  adminMessage?: string;
  requestMessage?: string;
  cartItemIds: CartItem["id"][];
};

export type TCreateInstantOrderCommand = {
  userId: User["id"];
  companyId: Company["id"];
  cartItemIds: CartItem["id"][];
  approverName: User["name"];
};

export type TOrderProductResult = {
  id: number;
  productId: number;
  orderId: Order["id"];
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  createdAt: Date;
};

export type TOrderBudgetResult = {
  currentMonthBudget: number | null;
  currentMonthExpense: number | null;
};

export type TCompanyOrderDetailForAdminResult = {
  id: Order["id"];
  companyId: Company["id"];
  userId: User["id"];
  approver: string | null;
  adminMessage: string | null;
  requestMessage: string | null;
  deliveryFee: number;
  productsPriceTotal: number;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  requester: string;
  products: TOrderProductResult[];
  budget: TOrderBudgetResult;
};

export type TCreateOrderResult = TCompanyOrderDetailForAdminResult;

export type TUpdateOrderStatusResult = {
  id: Order["id"];
  companyId: Company["id"];
  userId: User["id"];
  approver: string | null;
  adminMessage: string | null;
  requestMessage: string | null;
  deliveryFee: number;
  productsPriceTotal: number;
  createdAt: Date;
  updatedAt: Date;
  status: TOrderStatus;
};

export type TCreateInstantOrderResult = TUpdateOrderStatusResult;

export type TOrderUserSummaryResult = {
  id: User["id"];
  email: User["email"];
  name: User["name"];
  companyId: Company["id"];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role: User["role"];
};

export type TGetOrderByIdResult = {
  id: Order["id"];
  companyId: Company["id"];
  userId: User["id"];
  approver: string | null;
  adminMessage: string | null;
  requestMessage: string | null;
  productsPriceTotal: number;
  deliveryFee: number;
  createdAt: Date;
  updatedAt: Date;
  status: TOrderStatus;
  user: TOrderUserSummaryResult;
  receipts: TOrderProductResult[];
};

export type TOrderReceiptSummaryResult = {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type TGetOrdersByUserIdItemResult = {
  id: Order["id"];
  companyId: Company["id"];
  userId: User["id"];
  approver: string | null;
  adminMessage: string | null;
  requestMessage: string | null;
  deliveryFee: number;
  productsPriceTotal: number;
  createdAt: Date;
  updatedAt: Date;
  status: TOrderStatus;
  receipts: TOrderReceiptSummaryResult[];
};

export type TGetOrdersByUserIdResult = TGetOrdersByUserIdItemResult[];

export type TCancelOrderResult = Omit<TGetOrdersByUserIdItemResult, "status"> & {
  status: "CANCELED";
};

export type TStartOrderPaymentCommand = {
  adminId: User["id"];
  companyId: Company["id"];
};

export type TStartOrderPaymentResult = {
  orderId: Order["id"];
  paymentId: Payment["id"];
};
