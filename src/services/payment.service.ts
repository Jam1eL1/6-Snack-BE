import { Company, Payment, Prisma, User } from "../generated/prisma/client";
import prisma from "../config/prisma";
import { PAYMENT_CLAIM_DURATION_MS } from "../constants/payment.constants";
import orderRepository from "../repositories/order.repository";
import paymentRepository from "../repositories/payment.repository";
import budgetRepository from "../repositories/budget.repository";
import productRepository from "../repositories/product.repository";
import { BadRequestError, ConflictError, NotFoundError } from "../types/error";
import {
  TClaimPaymentCommand,
  TClaimPaymentResult,
  TCompletePaymentCommand,
  TCompletePaymentResult,
  TFailPaymentCommand,
  TFailPaymentResult,
  TGetPaymentResult,
  TRetryPaymentResult,
} from "../types/payment.types";
import getDateForBudget from "../utils/getDateForBudget";

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

const formatOrderProductName = (receipts: { productName: string }[]) => {
  const firstReceipt = receipts[0];

  if (!firstReceipt) {
    return "Order items";
  }

  if (receipts.length === 1) {
    return firstReceipt.productName;
  }

  return `${firstReceipt.productName} and ${receipts.length - 1} more`;
};
const formatPayment = (payment: TPaymentRecord, adminId: string, now = new Date()): TGetPaymentResult => {
  const expiresAt = payment.order.paymentClaimExpiresAt;
  const isActive = Boolean(payment.order.paymentAssigneeId && expiresAt && expiresAt > now);
  const { receipts, ...order } = payment.order;
  return {
    ...payment,
    order: {
      ...order,
      productName: formatOrderProductName(receipts),
    },
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

const failPayment = async (paymentId: Payment["id"], command: TFailPaymentCommand): Promise<TFailPaymentResult> => {
  return await prisma.$transaction(async (tx) => {
    const payment = await paymentRepository.getPaymentById(paymentId, tx);

    if (!payment || payment.order.companyId !== command.companyId) {
      throw new NotFoundError("Payment not found.");
    }

    if (payment.status !== "PENDING" || payment.order.status !== "PENDING") {
      throw new ConflictError("Payment is no longer available to fail.");
    }

    const now = new Date();
    const assigneeId = payment.order.paymentAssigneeId;
    const expiresAt = payment.order.paymentClaimExpiresAt;

    if (assigneeId !== command.adminId || !expiresAt || expiresAt <= now) {
      throw new ConflictError("You do not own an active payment claim.");
    }

    const failed = await paymentRepository.updatePayment(
      paymentId,
      "PENDING",
      {
        status: "FAILED",
        failureReason: command.failureReason,
      },
      tx,
    );

    if (failed.count !== 1) {
      throw new ConflictError("Payment is no longer available to fail.");
    }

    const clearedClaim = await orderRepository.clearPaymentClaim(payment.orderId, command.adminId, tx);

    if (clearedClaim.count !== 1) {
      throw new ConflictError("Payment claim is no longer available.");
    }

    const failedPayment = await paymentRepository.getPaymentById(paymentId, tx);

    if (!failedPayment) {
      throw new NotFoundError("Payment not found.");
    }

    return formatPayment(failedPayment, command.adminId, now);
  });
};

const completePayment = async (
  paymentId: Payment["id"],
  command: TCompletePaymentCommand,
): Promise<TCompletePaymentResult> => {
  return await prisma.$transaction(async (tx) => {
    const payment = await paymentRepository.getPaymentForCompletion(paymentId, tx);

    if (!payment || payment.order.companyId !== command.companyId) {
      throw new NotFoundError("Payment not found.");
    }

    if (payment.status !== "PENDING" || payment.order.status !== "PENDING") {
      throw new ConflictError("Payment is no longer available to complete.");
    }

    const now = new Date();
    const assigneeId = payment.order.paymentAssigneeId;
    const claimExpiresAt = payment.order.paymentClaimExpiresAt;

    if (assigneeId !== command.adminId || !claimExpiresAt || claimExpiresAt <= now) {
      throw new ConflictError("You do not own an active payment claim.");
    }

    if (payment.authorizedPayerId !== command.adminId) {
      throw new ConflictError("Payment payer does not match the active claim owner.");
    }

    const expectedAmount = payment.order.productsPriceTotal + payment.order.deliveryFee;

    if (payment.amount !== expectedAmount) {
      throw new ConflictError("Payment amount does not match the Order total.");
    }

    const completed = await paymentRepository.updatePayment(
      paymentId,
      "PENDING",
      {
        status: "PAID",
        completedAt: now,
        failureReason: null,
      },
      tx,
    );

    if (completed.count !== 1) {
      throw new ConflictError("Payment is no longer available to complete.");
    }

    const finalOrderStatus = payment.order.user.role === "USER" ? "APPROVED" : "INSTANT_APPROVED";
    const completedOrder = await orderRepository.completePaidOrder(
      payment.orderId,
      command.adminId,
      command.approverName,
      finalOrderStatus,
      now,
      tx,
    );

    if (completedOrder.count !== 1) {
      throw new ConflictError("Order is no longer available to complete.");
    }

    const { year, month, previousMonth, previousMonthYear } = getDateForBudget();
    let monthlyBudget = await budgetRepository.getMonthlyBudget(
      {
        companyId: command.companyId,
        year,
        month,
      },
      tx,
    );

    if (!monthlyBudget) {
      const previousBudget = await budgetRepository.getMonthlyBudget(
        {
          companyId: command.companyId,
          year: previousMonthYear,
          month: previousMonth,
        },
        tx,
      );
      const defaultBudgetAmount = previousBudget?.monthlyBudget ?? 0;

      monthlyBudget = await budgetRepository.upsertMonthlyBudget(
        {
          companyId: command.companyId,
          year,
          month,
          currentMonthExpense: 0,
          currentMonthBudget: defaultBudgetAmount,
          monthlyBudget: defaultBudgetAmount,
        },
        tx,
      );
    }

    if (monthlyBudget.currentMonthExpense + payment.amount > monthlyBudget.currentMonthBudget) {
      throw new BadRequestError("Insufficient budget.");
    }

    const budgetUpdate = await budgetRepository.incrementCurrentMonthExpense(
      monthlyBudget.id,
      monthlyBudget.currentMonthExpense,
      payment.amount,
      tx,
    );

    if (budgetUpdate.count !== 1) {
      throw new ConflictError("Budget changed while Payment was completing. Please try again.");
    }

    const productIds = [...new Set(payment.order.receipts.map((receipt) => receipt.productId))];
    const productUpdate = await productRepository.updateCumulativeSales(productIds, tx);

    if (productUpdate.count !== productIds.length) {
      throw new ConflictError("One or more Products are no longer available.");
    }

    const completedPayment = await paymentRepository.getPaymentById(paymentId, tx);

    if (!completedPayment) {
      throw new NotFoundError("Payment not found.");
    }

    return formatPayment(completedPayment, command.adminId, now);
  });
};

export default {
  getPayment,
  claimPayment,
  retryPayment,
  failPayment,
  completePayment,
};
