import { randomUUID } from "node:crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "../generated/prisma/client";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../constants/auth.constants";
import { TAccessTokenPayload, TRefreshTokenPayload } from "../types/authToken.type";
import { AuthenticationError } from "../types/error";
/**
 * TODO
 * 1. Validate token secrets
 * 2. Sign the access token
 * 3. Sign the refresh token
 * 4. Build a token verification helper to share
 * 5. Build an accessToken verifying function
 * 6. BUild a refreshToken verifying function
 * 7. Export functions
 */

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required.");
}

const signAccessToken = (userId: string, role: Role): string => {
  const payload: TAccessTokenPayload = {
    userId,
    role,
    tokenType: "access",
  };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    jwtid: randomUUID(),
  });
};

const signRefreshToken = (userId: string): string => {
  const payload: TRefreshTokenPayload = {
    userId,
    tokenType: "refresh",
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    jwtid: randomUUID(),
  });
};

const verifyJwt = (token: string, secret: string, tokenName: "Access" | "Refresh"): JwtPayload => {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof payload === "string") {
      throw new AuthenticationError(`${tokenName} token is invalid.`);
    }

    return payload;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError(`${tokenName} token has expired.`);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError(`${tokenName} token is invalid.`);
    }

    throw error;
  }
};

const verifyAccessToken = (token: string): TAccessTokenPayload => {
  const payload = verifyJwt(token, ACCESS_TOKEN_SECRET, "Access");

  if (
    typeof payload.userId !== "string" ||
    !Object.values(Role).includes(payload.role as Role) ||
    payload.tokenType !== "access"
  ) {
    throw new AuthenticationError("Access token is invalid.");
  }

  return {
    userId: payload.userId,
    role: payload.role as Role,
    tokenType: payload.tokenType,
  };
};

const verifyRefreshToken = (token: string): TRefreshTokenPayload => {
  const payload = verifyJwt(token, REFRESH_TOKEN_SECRET, "Refresh");

  if (typeof payload.userId !== "string" || payload.tokenType !== "refresh") {
    throw new AuthenticationError("Refresh token is invalid.");
  }

  return {
    userId: payload.userId,
    tokenType: payload.tokenType,
  };
};

export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
