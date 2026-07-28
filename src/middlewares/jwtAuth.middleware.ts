import { RequestHandler } from "express";
import authService from "../services/auth.service";
import { AuthenticationError } from "../types/error";

const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AuthenticationError("Authentication token was not provided.");
    }

    req.user = await authService.authenticateAccessToken(accessToken);
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateToken;
