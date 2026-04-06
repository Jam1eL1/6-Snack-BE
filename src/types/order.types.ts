import { Order } from "../generated/prisma/client";

export type TGetOrdersQuery = {
  page: number;
  limit: number;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status: "pending" | "approved";
};

export type TGetOrdersRepositoryQuery = {
  offset: number;
  limit: number;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status: "pending" | "approved";
};

export type TGetOrderStatus = {
  pending: "PENDING";
  approved: ["APPROVED", "INSTANT_APPROVED"];
};
