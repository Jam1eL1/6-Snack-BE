import { Payment, Prisma } from "../generated/prisma/client";
import prisma from "../config/prisma";
const getPaymentById = async (paymentId: Payment["id"], tx?: Prisma.TransactionClient) => {
  const client = tx ?? prisma;
  return client.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      order: {
        select: {
          id: true,
          companyId: true,
          userId: true,
          status: true,
          paymentAssigneeId: true,
          paymentClaimExpiresAt: true,
        },
      },
    },
  });
};

const updatePayment = async (
  paymentId: Payment["id"],
  expectedStatus: Payment["status"],
  data: Prisma.PaymentUncheckedUpdateManyInput,
  tx: Prisma.TransactionClient,
) => {
  return await tx.payment.updateMany({
    where: { id: paymentId, status: expectedStatus },
    data,
  });
};
export default {
  getPaymentById,
  updatePayment,
};
