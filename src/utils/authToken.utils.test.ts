import { Role } from "../generated/prisma/client";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../types/error";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./authToken.utils";

describe("authToken.utils", () => {
  it("signs and verifies an access token", () => {
    const userId = "user-123";
    const role = Role.USER;
    const token = signAccessToken(userId, role);
    const payload = verifyAccessToken(token);
    expect(typeof token).toBe("string");
    expect(payload).toEqual({
      userId,
      role,
      tokenType: "access",
    });
  });

  it("signs and verifies a refresh token", () => {
    //  Arrange
    const userId = "user-123";
    //  Act
    const token = signRefreshToken(userId);
    const payload = verifyRefreshToken(token);

    //  Assert
    expect(typeof token).toBe("string");
    expect(payload).toEqual({
      userId,
      tokenType: "refresh",
    });
  });

  it("rejects a refresh token as an access token", () => {
    const refreshToken = signRefreshToken("user-123");

    expect(() => verifyAccessToken(refreshToken)).toThrow(AuthenticationError);
  });

  it("translates an expired access token into AuthenticationError", () => {
    const expiredToken = jwt.sign(
      {
        userId: "user-123",
        role: Role.USER,
        tokenType: "access",
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        algorithm: "HS256",
        expiresIn: -1,
      },
    );

    expect(() => verifyAccessToken(expiredToken)).toThrow("Access token has expired.");
  });

  it("translates a malformed access token into AuthenticationError", () => {
    expect(() => verifyAccessToken("not-a-jwt")).toThrow("Access token is invalid.");
  });
});
