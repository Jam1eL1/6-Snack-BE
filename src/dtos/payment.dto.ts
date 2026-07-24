import { TClaimPaymentResult, TGetPaymentResult } from "../types/payment.types";

export type TGetPaymentParamsDto = {
  paymentId: string;
};

export type TGetPaymentResponseDto = {
  message: string;
  data: TGetPaymentResult;
};

export type TClaimPaymentResponseDto = {
  message: string;
  data: TClaimPaymentResult;
};
