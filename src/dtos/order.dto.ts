export type TGetOrdersQueryDto = {
  page: string;
  limit: string;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status: "pending" | "approved";
};

export type TGetOrderQueryDto = {
  page: string;
  limit: string;
  orderBy: "latest" | "priceLow" | "priceHigh";
  status?: "pending" | "approved";
};

export type TGetOrderParamsDto = {
  orderId: string;
};

export type TUpdateStatusOrderBodyDto = {
  adminMessage?: string;
  status: "APPROVED" | "REJECTED";
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

export type TCompanyOrderDetailForAdminResponseDto = {
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
  products: TOrderProductResponseDto[];
  budget: TOrderBudgetResponseDto;
};
