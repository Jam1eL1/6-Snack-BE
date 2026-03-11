import { Prisma, Role } from "../generated/prisma/client";
import prisma from "../config/prisma";

/**
 * Finds a user by email and includes company info.
 * @param email - User email to look up
 * @param tx - Transaction client (optional)
 * @returns User with company info, or null
 */
const findUserByEmailWithCompany = async (email: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { email },
    include: { company: true },
  });
};

/**
 * Finds a user by ID.
 * @param id - User ID to look up
 * @param tx - Transaction client (optional)
 * @returns User info, or null
 */
const findUserById = async (id: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { id },
  });
};

/**
 * Finds a company by business registration number.
 * @param bizNumber - Business registration number to look up
 * @param tx - Transaction client (optional)
 * @returns Company info, or null
 */
const findCompanyByBizNumber = async (bizNumber: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.company.findUnique({
    where: { bizNumber },
  });
};

/**
 * Finds invite info by ID.
 * @param inviteId - Invite ID to look up
 * @param tx - Transaction client (optional)
 * @returns Invite info, or null
 */
const findInviteById = async (inviteId: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.invite.findUnique({
    where: { id: inviteId },
  });
};

/**
 * Creates a new company.
 * @param data - Company data to create (name, business registration number)
 * @param tx - Transaction client (required)
 * @returns Created company info
 */
const createCompany = async (
  data: { name: string; bizNumber: string },
  tx: Prisma.TransactionClient,
) => {
  return tx.company.create({
    data: {
      name: data.name,
      bizNumber: data.bizNumber,
    },
  });
};

/**
 * Creates a new user.
 * @param data - User data to create (email, name, password, role, company ID)
 * @param tx - Transaction client (required)
 * @returns Created user info (selected fields only)
 */
const createUser = async (
  data: {
    email: string;
    name: string;
    password: string;
    role: Role;
    companyId: number;
  },
  tx: Prisma.TransactionClient,
) => {
  return tx.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
      companyId: data.companyId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
    },
  });
};

/**
 * Updates a user's hashed refresh token.
 * @param userId - User ID
 * @param hashedRefreshToken - New hashed refresh token (nullable)
 * @param tx - Transaction client (optional)
 * @returns Updated user info
 */
const updateUserRefreshToken = async (userId: string, hashedRefreshToken: string | null, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.user.update({
    where: { id: userId },
    data: { hashedRefreshToken },
  });
};

/**
 * Marks an invite as used.
 * @param inviteId - Invite ID
 * @param tx - Transaction client (required)
 */
const updateInviteToUsed = async (inviteId: string, tx: Prisma.TransactionClient) => {
  return tx.invite.update({
    where: { id: inviteId },
    data: { isUsed: true },
  });
};

/**
 * Creates a new monthly budget.
 * @param data - Monthly budget data to create (company ID, year, month)
 * @param tx - Transaction client (required)
 * @returns Created monthly budget info
 */
const createMonthlyBudget = async (
  data: {
    companyId: number;
    year: string;
    month: string;
  },
  tx: Prisma.TransactionClient,
) => {
  return tx.monthlyBudget.create({
    data: {
      companyId: data.companyId,
      year: data.year,
      month: data.month,
      currentMonthExpense: 0,
      currentMonthBudget: 0,
      monthlyBudget: 0,
    },
  });
};

/**
 * Runs a Prisma transaction.
 * @param callback - Async callback executed inside the transaction
 * @returns Callback result
 */
const runInTransaction = async <T>(
  callback: (prismaTransaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  return prisma.$transaction(callback);
};

export default {
  findUserByEmailWithCompany,
  findUserById,
  findCompanyByBizNumber,
  findInviteById,
  createCompany,
  createUser,
  createMonthlyBudget,
  updateUserRefreshToken,
  updateInviteToUsed,
  runInTransaction,
};
