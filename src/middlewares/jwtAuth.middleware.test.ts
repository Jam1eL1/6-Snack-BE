import { Request, Response } from "express";
import { Role } from "../generated/prisma/client";
import authService from "../services/auth.service";
import { AuthenticationError } from "../types/error";
import authenticateToken from "./jwtAuth.middleware";

jest.mock("../services/auth.service", () => ({
  __esModule: true,
  default: {
    authenticateAccessToken: jest.fn(),
  },
}));

const authenticatedUser = {
  id: "user-123",
  email: "user@example.com",
  name: "Test User",
  companyId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  role: Role.USER,
  company: {
    id: 1,
    name: "Test Company",
    bizNumber: "123456789",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const runMiddleware = async (req: Request, next: jest.Mock) => {
  await authenticateToken(req, {} as Response, next);
};

describe("authenticateToken", () => {
  const mockedAuthenticateAccessToken = jest.mocked(authService.authenticateAccessToken);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards an authentication error when the access token is missing", async () => {
    const req = { cookies: {} } as unknown as Request;
    const next = jest.fn();

    await runMiddleware(req, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    expect(mockedAuthenticateAccessToken).not.toHaveBeenCalled();
  });

  it("sets req.user for a valid access token", async () => {
    const req = { cookies: { accessToken: "valid-access-token" } } as unknown as Request;
    const next = jest.fn();
    mockedAuthenticateAccessToken.mockResolvedValue(authenticatedUser);

    await runMiddleware(req, next);

    expect(mockedAuthenticateAccessToken).toHaveBeenCalledWith("valid-access-token");
    expect(req.user).toEqual(authenticatedUser);
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards deleted-user authentication failures", async () => {
    const req = { cookies: { accessToken: "deleted-user-token" } } as unknown as Request;
    const next = jest.fn();
    const error = new AuthenticationError("Authentication is invalid.");
    mockedAuthenticateAccessToken.mockRejectedValue(error);

    await runMiddleware(req, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("preserves unexpected service failures", async () => {
    const req = { cookies: { accessToken: "valid-access-token" } } as unknown as Request;
    const next = jest.fn();
    const error = new Error("Repository unavailable");
    mockedAuthenticateAccessToken.mockRejectedValue(error);

    await runMiddleware(req, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
