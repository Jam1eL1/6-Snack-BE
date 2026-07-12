import { CartItem, Company, Order, User } from "../generated/prisma/client";

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
