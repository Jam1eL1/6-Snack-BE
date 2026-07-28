import bcrypt from "bcrypt";
import { Role } from "../generated/prisma/client";
import authRepository from "../repositories/auth.repository";
import { AuthenticationError, NotFoundError, ValidationError } from "../types/error";
import { getCurrentYearAndMonth, isExpired } from "../utils/date.utils";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/authToken.utils";

const authenticateAccessToken = async (accessToken: string) => {
  const payload = verifyAccessToken(accessToken);
  const user = await authRepository.findUserByIdWithCompany(payload.userId);
  if (!user || user.deletedAt) throw new AuthenticationError("Authentication is invalid.");
  return user;
};
const signUpSuperAdmin = async (data: {
  email: string;
  name: string;
  password: string;
  companyName: string;
  bizNumber: string;
}) => {
  const existingUser = await authRepository.findUserByEmailWithCompany(data.email);
  if (existingUser) {
    throw new ValidationError("This email is already registered.");
  }
  const existingCompany = await authRepository.findCompanyByBizNumber(data.bizNumber);
  if (existingCompany) {
    throw new ValidationError("This business registration number is already registered.");
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const transactionResult = await authRepository.runInTransaction(async (prismaTransaction) => {
    const createdCompany = await authRepository.createCompany(
      {
        name: data.companyName,
        bizNumber: data.bizNumber,
      },
      prismaTransaction,
    );
    const createdUser = await authRepository.createUser(
      {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        companyId: createdCompany.id,
      },
      prismaTransaction,
    );
    const { currentYear, currentMonth } = getCurrentYearAndMonth();
    const createdMonthlyBudget = await authRepository.createMonthlyBudget(
      {
        companyId: createdCompany.id,
        year: currentYear,
        month: currentMonth,
      },
      prismaTransaction,
    );
    return { company: createdCompany, user: createdUser, monthlyBudget: createdMonthlyBudget };
  });
  return transactionResult;
};

const signUpViaInvite = async (inviteId: string, password: string) => {
  const invite = await authRepository.findInviteById(inviteId);
  if (!invite) {
    throw new NotFoundError("The invite link is invalid.");
  }
  if (invite.isUsed) {
    throw new ValidationError("This invite link has already been used.");
  }
  if (isExpired(invite.expiresAt)) {
    throw new ValidationError("This invite link has expired.");
  }
  const existingUser = await authRepository.findUserByEmailWithCompany(invite.email);
  if (existingUser) {
    throw new ValidationError("This email is already registered.");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await authRepository.runInTransaction(async (prismaTransaction) => {
    const createdUser = await authRepository.createUser(
      {
        email: invite.email,
        name: invite.name,
        password: hashedPassword,
        role: invite.role,
        companyId: invite.companyId,
      },
      prismaTransaction,
    );
    await authRepository.updateInviteToUsed(inviteId, prismaTransaction);
    return createdUser;
  });
  return newUser;
};

const login = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepository.findUserByEmailWithCompany(normalizedEmail);
  if (!user || user.deletedAt) {
    throw new AuthenticationError("Email or password is incorrect.");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Email or password is incorrect.");
  }
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await authRepository.updateUserRefreshToken(user.id, hashedRefreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await authRepository.findUserById(payload.userId);

  if (!user || user.deletedAt || !user.hashedRefreshToken) {
    throw new AuthenticationError("Refresh token is invalid.");
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

  if (!isRefreshTokenValid) {
    throw new AuthenticationError("Refresh token is invalid.");
  }

  const newAccessToken = signAccessToken(user.id, user.role);
  const newRefreshToken = signRefreshToken(user.id);
  const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  await authRepository.updateUserRefreshToken(user.id, newHashedRefreshToken);

  return { newAccessToken, newRefreshToken };
};

const logout = async (refreshToken?: string): Promise<void> => {
  if (!refreshToken) return;

  let userId: string;

  try {
    userId = verifyRefreshToken(refreshToken).userId;
  } catch (error) {
    if (error instanceof AuthenticationError) return;
    throw error;
  }

  const user = await authRepository.findUserById(userId);

  if (!user?.hashedRefreshToken) return;

  const isCurrentRefreshToken = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

  if (!isCurrentRefreshToken) return;

  await authRepository.updateUserRefreshToken(user.id, null);
};

export default {
  signUpSuperAdmin,
  signUpViaInvite,
  login,
  authenticateAccessToken,
  refreshAccessToken,
  logout,
};
