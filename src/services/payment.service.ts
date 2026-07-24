import { Company, Payment, Prisma, User } from "../generated/prisma/client";
import prisma from "../config/prisma";
import { PAYMENT_CLAIM_DURATION_MS } from "../constants/payment.constants";
import orderRepository from "../repositories/order.repository";
import paymentRepository from "../repositories/payment.repository";
import { ConflictError, NotFoundError } from "../types/error";
import {
  TClaimPaymentCommand,
  TClaimPaymentResult,
  TGetPaymentResult,
  TRetryPaymentResult,
} from "../types/payment.types";

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

const claimPayment = async (paymentId: Payment["id"], command: TClaimPaymentCommand): Promise<TClaimPaymentResult> => {
  return await prisma.$transaction(async (tx) => {
    const payment = await paymentRepository.getPaymentById(paymentId, tx);

    if (!payment || payment.order.companyId !== command.companyId) {
      throw new NotFoundError("Payment not found.");
    }

    if (payment.status !== "PENDING" || payment.order.status !== "PENDING") {
      throw new ConflictError("Payment is no longer available.");
    }

    const now = new Date();
    const currentAssigneeId = payment.order.paymentAssigneeId;
    const currentExpiresAt = payment.order.paymentClaimExpiresAt;
    const isActive = Boolean(currentAssigneeId && currentExpiresAt && currentExpiresAt > now);

    if (isActive && currentAssigneeId === command.adminId) {
      return formatPayment(payment, command.adminId, now);
    }

    if (isActive) {
      throw new ConflictError("Another admin owns this payment claim.");
    }

    const expiresAt = new Date(now.getTime() + PAYMENT_CLAIM_DURATION_MS);
    const claim = await orderRepository.acquirePaymentClaim(
      payment.orderId,
      command.companyId,
      command.adminId,
      now,
      expiresAt,
      tx,
    );

    if (claim.count !== 1) {
      throw new ConflictError("Another admin acquired this payment.");
    }

    const payerUpdate = await paymentRepository.updatePayment(
      paymentId,
      "PENDING",
      { authorizedPayerId: command.adminId },
      tx,
    );

    if (payerUpdate.count !== 1) {
      throw new ConflictError("Payment is no longer available.");
    }

    const claimedPayment = await paymentRepository.getPaymentById(paymentId, tx);

    if (!claimedPayment) {
      throw new NotFoundError("Payment not found.");
    }

    return formatPayment(claimedPayment, command.adminId, now);
  });
};

const retryPayment = async (paymentId: Payment["id"], command: TClaimPaymentCommand): Promise<TRetryPaymentResult> => {
  //   -> start transaction
  // -> load Payment and Order
  // -> return 404 for missing or cross-company Payment
  // -> require Order PENDING
  // -> require Payment FAILED
  return await prisma.$transaction(async (tx) => {
    const payment = await paymentRepository.getPaymentById(paymentId, tx);

    if (!payment || payment.order.companyId !== command.companyId) {
      throw new NotFoundError("Payment not found.");
    }

    if (payment.status !== "FAILED" || payment.order.status !== "PENDING") {
      throw new ConflictError("Payment is no longer available.");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + PAYMENT_CLAIM_DURATION_MS);

    const claim = await orderRepository.acquirePaymentClaim(
      payment.orderId,
      command.companyId,
      command.adminId,
      now,
      expiresAt,
      tx,
    );

    if (claim.count !== 1) {
      throw new ConflictError("Another admin acquired this payment.");
    }
    const newData: Prisma.PaymentUncheckedUpdateManyInput = {
      status: "PENDING",
      authorizedPayerId: command.adminId,
      failureReason: null,
      completedAt: null,
    };
    const retry = await paymentRepository.updatePayment(paymentId, "FAILED", newData, tx);
    if (retry.count !== 1) {
      throw new ConflictError("Payment is no longer available to retry.");
    }
    const retriedPayment = await paymentRepository.getPaymentById(paymentId, tx);
    if (!retriedPayment) {
      throw new NotFoundError("Payment not found.");
    }
    return formatPayment(retriedPayment, command.adminId, now);
  });
};
export default {
  getPayment,
  claimPayment,
  retryPayment,
};
