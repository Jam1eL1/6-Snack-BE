import type {
  TCompanyOrderDetailForAdminResult,
  TCreateInstantOrderResult,
  TCreateOrderResult,
  TGetOrdersResult,
  TUpdateOrderStatusResult,
} from "../types/order.types";

export type TGetOrdersQueryDto = {
  page: string;
  limit: string;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status: "pending" | "approved";
};

export type TGetOrderQueryDto = {
  status?: "pending" | "approved";
};

export type TGetOrderParamsDto = {
  orderId: string;
};

export type TUpdateStatusOrderBodyDto = {
  adminMessage?: string;
  status: "APPROVED" | "REJECTED";
};

export type TCreateOrderBodyDto = {
  adminMessage?: string;
  requestMessage?: string;
  cartItemIds: number[];
};

export type TCreateInstantOrderBodyDto = {
  cartItemIds: number[];
};

export type TCancelOrderBodyDto = {
  status: "CANCELED";
};

export type TGetOrderResponseDto = {
  message: string;
  data: TCompanyOrderDetailForAdminResult;
};

export type TOrderProductResponseDto = {
  id: number;
  productId: number;
  orderId: string;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  createdAt: Date;
};

export type TOrderBudgetResponseDto = {
  currentMonthBudget: number | null;
  currentMonthExpense: number | null;
};

export type TCreateOrderResponseDto = TCreateOrderResult;

export type TUpdateOrderStatusResponseDto = {
  message: string;
  data: TUpdateOrderStatusResult;
};

export type TGetOrdersMetaResponseDto = {
  totalCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type TGetOrdersItemResponseDto = {
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

export type TGetOrdersResponseDto = {
  message: string;
  data: TGetOrdersResult;
};

export type TOrderUserSummaryResponseDto = {
  id: string;
  email: string;
  name: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role: string;
};

export type TGetOrderByIdReceiptResponseDto = {
  id: number;
  productId: number;
  orderId: string;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  createdAt: Date;
};

export type TGetOrderByIdDataResponseDto = {
  id: string;
  companyId: number;
  userId: string;
  approver: string | null;
  adminMessage: string | null;
  requestMessage: string | null;
  productsPriceTotal: number;
  deliveryFee: number;
  createdAt: Date;
  updatedAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "INSTANT_APPROVED";
  user: TOrderUserSummaryResponseDto;
  receipts: TGetOrderByIdReceiptResponseDto[];
};

export type TGetOrderByIdResponseDto = {
  message: string;
  data: TGetOrderByIdDataResponseDto;
};

export type TGetOrdersByUserIdItemResponseDto = {
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "INSTANT_APPROVED";
  receipts: TCancelOrderReceiptResponseDto[];
};

export type TGetOrdersByUserIdResponseDto = {
  message: string;
  data: TGetOrdersByUserIdItemResponseDto[];
};

export type TCancelOrderReceiptResponseDto = {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type TCancelOrderDataResponseDto = {
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
  status: "CANCELED";
  receipts: TCancelOrderReceiptResponseDto[];
};

export type TCancelOrderResponseDto = {
  message: string;
  data: TCancelOrderDataResponseDto;
};

export type TCreateInstantOrderResponseDto = {
  message: string;
  data: TCreateInstantOrderResult;
};
