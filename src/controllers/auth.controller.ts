import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import authService from "../services/auth.service";
import { BadRequestError, ValidationError } from "../types/error";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and Authorization API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up (Super Admin)
 *     description: Creates a new company and registers the user as its SUPER_ADMIN.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password, confirmPassword, companyName, bizNumber]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               name:
 *                 type: string
 *                 example: Admin Kim
 *               password:
 *                 type: string
 *                 example: StrongP@ssw0rd!
 *               confirmPassword:
 *                 type: string
 *                 description: passwordConfirm is also allowed (either one)
 *                 example: StrongP@ssw0rd!
 *               companyName:
 *                 type: string
 *                 example: Oho Snack Inc.
 *               bizNumber:
 *                 type: string
 *                 description: Business registration number (unique)
 *                 example: 123-45-67890
 *     responses:
 *       201:
 *         description: Sign-up successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                     role: { type: string, enum: [SUPER_ADMIN] }
 *                 company:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                 monthlyBudget:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     year: { type: string }
 *                     month: { type: string }
 *                     currentMonthExpense: { type: number }
 *                     currentMonthBudget: { type: number }
 *                     monthlyBudget: { type: number }
 *       400:
 *         description: Missing required fields
 *       422:
 *         description: Validation failed (e.g., password mismatch, duplicate email/business number)
 */
const signUpSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password, confirmPassword, passwordConfirm, role, companyName, bizNumber } = req.body;
    const passwordConfirmation = confirmPassword || passwordConfirm;
    if (!email || !name || !password || !passwordConfirmation || !companyName || !bizNumber) {
      throw new BadRequestError(
        "Email, name, password, password confirmation, company name, and business registration number are all required.",
      );
    }
    if (password !== passwordConfirmation) {
      throw new ValidationError("Password and password confirmation do not match.");
    }
    if (role && role !== Role.SUPER_ADMIN) {
      throw new ValidationError("This endpoint is for SUPER_ADMIN sign-up only. Role must be SUPER_ADMIN.");
    }
    const transactionResult = await authService.signUpSuperAdmin({ email, name, password, companyName, bizNumber });
    const newUser = transactionResult.user;
    const registeredCompany = transactionResult.company;
    const monthlyBudget = transactionResult.monthlyBudget;
    console.log(
      `[Sign-up success] New SUPER_ADMIN user: ${newUser.email}, company: ${registeredCompany.name}, budget created: ${monthlyBudget.year}-${monthlyBudget.month}`,
    );
    res.status(201).json({
      message: "Super admin sign-up completed successfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      company: {
        id: registeredCompany.id,
        name: registeredCompany.name,
      },
      monthlyBudget: {
        id: monthlyBudget.id,
        year: monthlyBudget.year,
        month: monthlyBudget.month,
        currentMonthExpense: monthlyBudget.currentMonthExpense,
        currentMonthBudget: monthlyBudget.currentMonthBudget,
        monthlyBudget: monthlyBudget.monthlyBudget,
      },
    });
  } catch (error) {
    console.error("[Sign-up error]", error);
    next(error);
  }
};

/**
 * @swagger
 * /auth/signup/{inviteId}:
 *   post:
 *     summary: Sign up (Invite)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique invite ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmPassword]
 *             properties:
 *               password:
 *                 type: string
 *                 example: StrongP@ssw0rd!
 *               confirmPassword:
 *                 type: string
 *                 description: passwordConfirm is also allowed
 *                 example: StrongP@ssw0rd!
 *     responses:
 *       201:
 *         description: Sign-up completed
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Invite not found
 *       422:
 *         description: Validation failed (e.g., password mismatch, used/expired invite, duplicate email)
 */
const signUpViaInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inviteId } = req.params;
    const { password, confirmPassword, passwordConfirm } = req.body;
    const passwordConfirmation = confirmPassword || passwordConfirm;
    if (!password || !passwordConfirmation) {
      throw new BadRequestError("Password and password confirmation are required.");
    }
    if (password !== passwordConfirmation) {
      throw new ValidationError("Password and password confirmation do not match.");
    }
    const newUser = await authService.signUpViaInvite(inviteId, password);
    console.log(`[Invite sign-up success] New user: ${newUser.email} (${newUser.role})`);
    res.status(201).json({
      message: "Sign-up completed successfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("[Invite sign-up error]", error);
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *               password: { type: string, example: StrongP@ssw0rd! }
 *     responses:
 *       200:
 *         description: Login successful (issues JWT cookies)
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: accessToken JWT (15 min) and refreshToken JWT (7 days) are issued as httpOnly cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                     name: { type: string }
 *                     role: { type: string }
 *                     company:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         name: { type: string }
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication failed (email/password mismatch)
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and password are both required.");
    }
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = isProduction ? ".5nack.site" : undefined;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      expires: accessTokenExpires,
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      expires: refreshTokenExpires,
      path: "/",
    });
    console.log(`[Login success] User: ${user.email} (${user.role}), company: ${user.company.name})`);
    res.status(200).json({
      message: "Login completed successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: {
          id: user.company.id,
          name: user.company.name,
        },
      },
    });
  } catch (error) {
    console.error("[Login error]", error);
    next(error);
  }
};

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Reissue access token
 *     tags: [Auth]
 *     description: Reissues new accessToken and refreshToken if refreshToken httpOnly cookie is valid.
 *     responses:
 *       200:
 *         description: Token reissued successfully (delivered via cookies)
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: New accessToken / refreshToken cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "A new access token has been issued." }
 *       400:
 *         description: Refresh token is missing
 *       401:
 *         description: Refresh token is invalid or expired
 */
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new BadRequestError("Refresh token was not provided. Please log in again.");
    }
    const { newAccessToken, newRefreshToken, user } = await authService.refreshAccessToken(refreshToken);
    const newAccessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    const newRefreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = isProduction ? ".5nack.site" : undefined;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      expires: newAccessTokenExpires,
      path: "/",
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      expires: newRefreshTokenExpires,
      path: "/",
    });
    console.log(`[Token refresh success] User: ${user.email}`);
    res.status(200).json({ message: "A new access token has been issued." });
  } catch (error) {
    console.error("[Token refresh error]", error);
    next(error);
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     description: Logs out the currently authenticated user by clearing auth cookies. Requires a valid accessToken cookie.
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Logged out successfully." }
 *       401:
 *         description: Authentication failed
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new BadRequestError("User is not authenticated.");
    }
    await authService.logout(req.user.id);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = isProduction ? ".5nack.site" : undefined;
    res.clearCookie("accessToken", {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });
    console.log(`[Logout success] User: ${req.user.email}`);
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("[Logout error]", error);
    next(error);
  }
};

export default { signUpSuperAdmin, signUpViaInvite, login, refreshToken, logout };
