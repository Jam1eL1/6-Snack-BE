import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/client";
import { AuthenticationError, NotFoundError, ServerError } from "../types/error";
import prisma from "../config/prisma";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "your_very_strong_jwt_secret_key_please_change_this_in_production";

/**
 * Token authentication middleware.
 * Extracts accessToken from cookies, verifies JWT,
 * and sets user info on req.user.
 */
const authenticateToken: RequestHandler = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next(new AuthenticationError("Authentication token was not provided."));
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as {
      userId: string;
      email: string;
      role: Role;
    };

    const userWithCompany = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: true,
      },
    });

    if (!userWithCompany) {
      return next(new NotFoundError("User information was not found. Please log in again."));
    }

    req.user = userWithCompany;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AuthenticationError("Authentication token has expired."));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(new AuthenticationError("Authentication token is invalid."));
    } else {
      console.error("[Auth middleware error]", error);
      return next(new ServerError("An unknown error occurred during authentication."));
    }
  }
};

export default authenticateToken;
