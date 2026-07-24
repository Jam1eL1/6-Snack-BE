import type {
  TCompanyOrderDetailForAdminResult,
  TCancelOrderResult,
  TCreateInstantOrderResult,
  TCreateOrderResult,
  TGetOrderByIdResult,
  TGetOrdersByUserIdResult,
  TGetOrdersResult,
  TStartOrderPaymentResult,
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

export type TGetOrderResponseDto = {
  message: string;
  data: TCompanyOrderDetailForAdminResult;
};

export type TCreateOrderResponseDto = {
  message: string;
  data: TCreateOrderResult;
};

export type TUpdateOrderStatusResponseDto = {
  message: string;
  data: TUpdateOrderStatusResult;
};

export type TGetOrdersResponseDto = {
  message: string;
  data: TGetOrdersResult;
};

export type TGetOrderByIdResponseDto = {
  message: string;
  data: TGetOrderByIdResult;
};

export type TGetOrdersByUserIdResponseDto = {
  message: string;
  data: TGetOrdersByUserIdResult;
};

export type TCancelOrderResponseDto = {
  message: string;
  data: TCancelOrderResult;
};

export type TCreateInstantOrderResponseDto = {
  message: string;
  data: TCreateInstantOrderResult;
};

export type TStartOrderPaymentResponseDto = {
  message: string;
  data: TStartOrderPaymentResult;
};
