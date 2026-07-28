import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRouter = Router();

/**
 * SUPER_ADMIN sign-up route.
 * Creates a new company and registers the user as its super admin.
 * @route POST /auth/signup
 * @body {string} email - User email
 * @body {string} name - User name
 * @body {string} password - User password
 * @body {string} confirmPassword - Password confirmation (must match password, passwordConfirm is also supported)
 * @body {string} passwordConfirm - Password confirmation (must match password, same as confirmPassword)
 * @body {string} companyName - Company name (required)
 * @body {string} bizNumber - Business registration number (required, must be unique)
 * @returns {object} - Success message and created user/company/monthly budget info (excluding password)
 * @throws {AppError} - Input validation failure, duplicate email/business registration number
 */
authRouter.post("/signup", authController.signUpSuperAdmin);

/**
 * User sign-up route via invite link.
 * Completes sign-up by setting a password using a pre-created invite.
 *
 * @route POST /auth/signup/:inviteId
 * @param {string} inviteId - Unique invite link ID
 * @body {string} password - User password
 * @body {string} confirmPassword - Password confirmation (must match password, passwordConfirm is also supported)
 * @body {string} passwordConfirm - Password confirmation (must match password, same as confirmPassword)
 * @returns {object} - Success message and created user info (excluding password)
 * @throws {AppError} - Input validation failure, invalid/expired/used invite, duplicate email
 */
authRouter.post("/signup/:inviteId", authController.signUpViaInvite);

/**
 * User login route.
 * @route POST /auth/login
 * @body {string} email - User email
 * @body {string} password - User password
 * @returns {object} - Success message, user info (ID, email, name, role, company), and tokens (sent as cookies)
 * @throws {AppError} - Email/password mismatch
 */
authRouter.post("/login", authController.login);

/**
 * Access token refresh route.
 * @route POST /auth/refresh-token
 * @body {string} refreshToken (sent via cookie) - Refresh token to reissue tokens
 * @returns {object} - New access token (sent via cookie)
 * @throws {AppError} - Refresh token missing, invalid, or expired
 */
authRouter.post("/refresh-token", authController.refreshToken);

/**
 * User logout route.
 * @route POST /auth/logout
 * @returns {void} - 204 response after clearing authentication cookies
 * @throws {AppError} - Unexpected error during server-side token invalidation
 */
authRouter.post("/logout", authController.logout);

export default authRouter;
