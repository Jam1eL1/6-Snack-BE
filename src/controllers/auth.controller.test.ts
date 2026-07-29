import { Request, Response } from "express";
import { Role } from "../generated/prisma/client";
import authService from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/authCookie.utils";
import authController from "./auth.controller";

jest.mock("../services/auth.service", () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("../utils/authCookie.utils", () => ({
  clearAuthCookies: jest.fn(),
  setAuthCookies: jest.fn(),
}));

const loginResult = {
  user: {
    id: "user-123",
    email: "user@example.com",
    name: "Test User",
    role: Role.USER,
    company: {
      id: 1,
      name: "Test Company",
      bizNumber: "123456789",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const createResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  }) as unknown as Response;

describe("authController authentication cookies", () => {
  const mockedLogin = jest.mocked(authService.login);
  const mockedRefreshAccessToken = jest.mocked(authService.refreshAccessToken);
  const mockedLogout = jest.mocked(authService.logout);
  const mockedSetAuthCookies = jest.mocked(setAuthCookies);
  const mockedClearAuthCookies = jest.mocked(clearAuthCookies);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("sets both cookies after login", async () => {
    const req = {
      body: {
        email: "user@example.com",
        password: "password",
      },
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();
    mockedLogin.mockResolvedValue(loginResult);

    await authController.login(req, res, next);

    expect(mockedSetAuthCookies).toHaveBeenCalledWith(res, "access-token", "refresh-token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("replaces both cookies after refresh", async () => {
    const req = {
      cookies: {
        refreshToken: "current-refresh-token",
      },
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();
    mockedRefreshAccessToken.mockResolvedValue({
      newAccessToken: "new-access-token",
      newRefreshToken: "new-refresh-token",
    });

    await authController.refreshToken(req, res, next);

    expect(mockedSetAuthCookies).toHaveBeenCalledWith(res, "new-access-token", "new-refresh-token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("clears both cookies after refresh failure", async () => {
    const req = {
      cookies: {
        refreshToken: "invalid-refresh-token",
      },
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();
    const error = new Error("refresh failed");
    mockedRefreshAccessToken.mockRejectedValue(error);

    await authController.refreshToken(req, res, next);

    expect(mockedClearAuthCookies).toHaveBeenCalledWith(res);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("logs out and clears cookies without an access token", async () => {
    const req = {
      cookies: {},
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();
    mockedLogout.mockResolvedValue();

    await authController.logout(req, res, next);

    expect(mockedLogout).toHaveBeenCalledWith(undefined);
    expect(mockedClearAuthCookies).toHaveBeenCalledWith(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("clears cookies when server-side logout invalidation fails", async () => {
    const req = {
      cookies: {
        refreshToken: "refresh-token",
      },
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();
    const error = new Error("repository failed");
    mockedLogout.mockRejectedValue(error);

    await authController.logout(req, res, next);

    expect(mockedClearAuthCookies).toHaveBeenCalledWith(res);
    expect(next).toHaveBeenCalledWith(error);
  });
});
