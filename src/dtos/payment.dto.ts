import { TClaimPaymentResult, TGetPaymentResult, TRetryPaymentResult } from "../types/payment.types";

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

export type TRetryPaymentResponseDto = {
  message: string;
  data: TRetryPaymentResult;
};
