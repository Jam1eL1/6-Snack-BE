import { Company, Payment, Prisma, User } from "../generated/prisma/client";
import paymentRepository from "../repositories/payment.repository";
import { NotFoundError } from "../types/error";
import { TGetPaymentOrderResult, TGetPaymentResult } from "../types/payment.types";
type TPaymentRecord = NonNullable<Awaited<ReturnType<typeof paymentRepository.getPaymentById>>>;
const getPayment = async (
  paymentId: Payment["id"],
  companyId: Company["id"],
  adminId: User["id"],
): Promise<TGetPaymentResult> => {
  const payment = await paymentRepository.getPaymentById(paymentId);
  if (!payment || payment.order.companyId !== companyId) {
    throw new NotFoundError("Payment not found.");
  }
  return formatPayment(payment, adminId);
};

const formatPayment = (payment: TPaymentRecord, adminId: string, now = new Date()): TGetPaymentResult => {
  const expiresAt = payment.order.paymentClaimExpiresAt;
  const isActive = Boolean(payment.order.paymentAssigneeId && expiresAt && expiresAt > now);
  return {
    ...payment,
    claim: {
      isActive,
      isMine: isActive && payment.order.paymentAssigneeId === adminId,
    },
  };
};
export default {
  getPayment,
};
