import { Company, Order, Payment, User } from "../generated/prisma/client";

export type TGetPaymentOrderResult = {
  id: Order["id"];
  companyId: Company["id"];
  userId: User["id"];
  status: Order["status"];
  paymentAssigneeId: User["id"] | null;
  paymentClaimExpiresAt: Date | null;
};
export type TGetPaymentResult = {
  id: Payment["id"];
  orderId: Order["id"];
  authorizedPayerId: User["id"];
  amount: Payment["amount"];
  status: Payment["status"];
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  order: TGetPaymentOrderResult;
  claim: {
    isActive: boolean;
    isMine: boolean;
  };
};

export type TClaimPaymentCommand = {
  adminId: User["id"];
  companyId: Company["id"];
};
export type TClaimPaymentResult = TGetPaymentResult;

export type TRetryPaymentResult = TGetPaymentResult;

export type TFailPaymentCommand = TClaimPaymentCommand & {
  failureReason: string;
};

export type TFailPaymentResult = TGetPaymentResult;

export type TCreatePaymentCommand = {
  orderId: Order["id"];
  authorizedPayerId: User["id"];
  amount: Payment["amount"];
};

export type TCompletePaymentCommand = TClaimPaymentCommand & {
  approverName: User["name"];
};

export type TCompletePaymentResult = TGetPaymentResult;
