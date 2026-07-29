import bcrypt from "bcrypt";
import { Role } from "../generated/prisma/client";
import authRepository from "../repositories/auth.repository";
import { AuthenticationError } from "../types/error";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/authToken.utils";
import authService from "./auth.service";

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.mock("../repositories/auth.repository", () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(),
    updateUserRefreshToken: jest.fn(),
  },
}));

jest.mock("../utils/authToken.utils", () => ({
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

const user = {
  id: "user-123",
  email: "user@example.com",
  name: "Test User",
  password: "password-hash",
  companyId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  hashedRefreshToken: "current-refresh-hash",
  role: Role.USER,
};

describe("authService.refreshAccessToken", () => {
  const mockedFindUserById = jest.mocked(authRepository.findUserById);
  const mockedUpdateUserRefreshToken = jest.mocked(authRepository.updateUserRefreshToken);
  const mockedVerifyRefreshToken = jest.mocked(verifyRefreshToken);
  const mockedSignAccessToken = jest.mocked(signAccessToken);
  const mockedSignRefreshToken = jest.mocked(signRefreshToken);
  const mockedCompare = bcrypt.compare as jest.Mock;
  const mockedHash = bcrypt.hash as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedVerifyRefreshToken.mockReturnValue({
      userId: user.id,
      tokenType: "refresh",
    });
    mockedFindUserById.mockResolvedValue(user);
    mockedCompare.mockResolvedValue(true);
    mockedSignAccessToken.mockReturnValue("new-access-token");
    mockedSignRefreshToken.mockReturnValue("new-refresh-token");
    mockedHash.mockResolvedValue("new-refresh-hash");
    mockedUpdateUserRefreshToken.mockResolvedValue({
      ...user,
      hashedRefreshToken: "new-refresh-hash",
    });
  });

  it("rejects a refresh token for a missing user", async () => {
    mockedFindUserById.mockResolvedValue(null);

    await expect(authService.refreshAccessToken("refresh-token")).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rejects a user without a stored refresh-token hash", async () => {
    mockedFindUserById.mockResolvedValue({
      ...user,
      hashedRefreshToken: null,
    });

    await expect(authService.refreshAccessToken("refresh-token")).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rejects a refresh token that does not match the stored hash", async () => {
    mockedCompare.mockResolvedValue(false);

    await expect(authService.refreshAccessToken("refresh-token")).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rotates both tokens and stores the new refresh-token hash", async () => {
    await expect(authService.refreshAccessToken("refresh-token")).resolves.toEqual({
      newAccessToken: "new-access-token",
      newRefreshToken: "new-refresh-token",
    });

    expect(mockedCompare).toHaveBeenCalledWith("refresh-token", user.hashedRefreshToken);
    expect(mockedSignAccessToken).toHaveBeenCalledWith(user.id, user.role);
    expect(mockedSignRefreshToken).toHaveBeenCalledWith(user.id);
    expect(mockedHash).toHaveBeenCalledWith("new-refresh-token", 10);
    expect(mockedUpdateUserRefreshToken).toHaveBeenCalledWith(user.id, "new-refresh-hash");
  });

  it("rejects the old refresh token after rotation", async () => {
    mockedCompare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await authService.refreshAccessToken("old-refresh-token");

    await expect(authService.refreshAccessToken("old-refresh-token")).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("preserves bcrypt failures", async () => {
    const error = new Error("bcrypt failed");
    mockedCompare.mockRejectedValue(error);

    await expect(authService.refreshAccessToken("refresh-token")).rejects.toBe(error);
  });

  it("preserves repository failures", async () => {
    const error = new Error("repository failed");
    mockedFindUserById.mockRejectedValue(error);

    await expect(authService.refreshAccessToken("refresh-token")).rejects.toBe(error);
  });
});
