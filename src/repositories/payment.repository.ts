import prisma from "../config/prisma";
import { Payment, Prisma } from "../generated/prisma/client";

const createPayment = async (body: Omit<Payment, "id">, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  return await client.payment.create({
    data: body,
  });
};

export default {
  createPayment,
};
