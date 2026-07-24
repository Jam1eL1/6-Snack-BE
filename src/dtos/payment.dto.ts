import { TGetPaymentResult } from "../types/payment.types";

export type TGetPaymentParamsDto = {
  paymentId: string;
};

export type TGetPaymentResponseDto = {
  message: string;
  data: TGetPaymentResult;
};
