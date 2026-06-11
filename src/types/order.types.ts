import { Order } from "../generated/prisma/client";

export type TCompanyUserOrderDetailStatus = "pending" | "approved";

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
  adminMessage: string;
  status: "APPROVED" | "REJECTED";
};
