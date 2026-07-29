import prisma from "../config/prisma";
import { UserRole } from "../dtos/user.dto";

// Check whether the user currently exists
const findActiveUserById = async (id: string) => {
  return await prisma.user.findFirst({
    where: { id, deletedAt: null },
    // Exclude password and refresh-token data
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Soft-delete a user
const deleteUser = async (id: string) => {
  return await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// Update a user role
const updateUserRole = async (id: string, role: UserRole) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Update a user password
const updatePassword = async (id: string, hashedPassword: string) => {
  return await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Get users
const findUsersByCompanyId = async (companyId: number, name?: string, cursor?: string, limit: number = 5) => {
  const whereClause = {
    companyId: companyId,
    role: {
      not: "SUPER_ADMIN" as const, // Exclude super administrators from the user list
    },
    deletedAt: null,
    ...(name && {
      name: {
        contains: name,
        mode: "insensitive" as const, // Match without case sensitivity
      },
    }),
    ...(cursor && {
      id: {
        lt: cursor, // IDs before the cursor
      },
    }),
  };

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    take: limit + 1,
  });

  // Check whether a next page exists
  const hasNext = users.length > limit;
  const actualUsers = hasNext ? users.slice(0, limit) : users;

  return {
    users: actualUsers,
    hasNext,
    nextCursor: hasNext ? actualUsers[actualUsers.length - 1].id : undefined,
  };
};

// Check whether a previous page exists
const hasPreviousPage = async (companyId: number, cursor: string, name?: string) => {
  const count = await prisma.user.count({
    where: {
      companyId: companyId,
      role: {
        not: "SUPER_ADMIN" as const,
      },
      deletedAt: null,
      ...(name && {
        name: {
          contains: name,
          mode: "insensitive" as const,
        },
      }),
      id: {
        gt: cursor, // IDs after the cursor
      },
    },
  });

  return count > 0;
};

// Get a user and company by user ID
const findUserWithCompanyById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: { company: true },
  });
};


export default {
  findActiveUserById,
  deleteUser,
  updateUserRole,
  updatePassword,
  findUsersByCompanyId,
  hasPreviousPage,
  findUserWithCompanyById,
};
