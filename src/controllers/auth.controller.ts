import { RequestHandler } from "express";
import { Role } from "../generated/prisma/client";
import authService from "../services/auth.service";
import { BadRequestError, ValidationError } from "../types/error";
import { TInviteIdParamsDto } from "../dtos/invite.dto";
import { ACCESS_TOKEN_COOKIE_MAX_AGE_MS, REFRESH_TOKEN_COOKIE_MAX_AGE_MS } from "../constants/auth.constants";


const signUpSuperAdmin: RequestHandler = async (req, res, next) => {
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

const signUpViaInvite: RequestHandler<TInviteIdParamsDto> = async (req, res, next) => {
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

const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and password are both required.");
    }
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = isProduction ? ".5nack.site" : undefined;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
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

const refreshToken: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new BadRequestError("Refresh token was not provided. Please log in again.");
    }
    const { newAccessToken, newRefreshToken, user } = await authService.refreshAccessToken(refreshToken);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = isProduction ? ".5nack.site" : undefined;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
      path: "/",
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      domain: cookieDomain,
      secure: isProduction,
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
      path: "/",
    });
    console.log(`[Token refresh success] User: ${user.email}`);
    res.status(200).json({ message: "A new access token has been issued." });
  } catch (error) {
    console.error("[Token refresh error]", error);
    next(error);
  }
};

const logout: RequestHandler = async (req, res, next) => {
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
