import { Router } from "express";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import userController from "../controllers/user.controller";

const userRouter = Router();

/**
 * Gets the currently authenticated user.
 * @route GET /users/me
 * @middleware authenticateToken - Validates the access token.
 * @returns {object} - Current user information, including ID, email, name, role, and company.
 * @throws {AppError} - User not found or unauthenticated.
 */
userRouter.get("/me", authenticateToken, userController.getMe);

// Get user information
userRouter.get("/:userId/", authenticateToken, userController.getUserInfo);

// Change user password
userRouter.patch(
  "/:userId/password",
  authenticateToken,
  userController.updatePassword,
);
export default userRouter;
