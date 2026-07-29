import { RequestHandler } from "express";
import { Role } from "../generated/prisma/client";
import authService from "../services/auth.service";
import { AuthenticationError, BadRequestError, ValidationError } from "../types/error";
import { TInviteIdParamsDto } from "../dtos/invite.dto";
import { clearAuthCookies, setAuthCookies } from "../utils/authCookie.utils";

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
    next(error);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      throw new BadRequestError("Email and password are both required.");
    }

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    setAuthCookies(res, accessToken, refreshToken);

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
    next(error);
  }
};

const refreshToken: RequestHandler = async (req, res, next) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken;

    if (!currentRefreshToken) {
      throw new AuthenticationError("Refresh token was not provided.");
    }

    const { newAccessToken, newRefreshToken } = await authService.refreshAccessToken(currentRefreshToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ message: "A new access token has been issued." });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

const logout: RequestHandler = async (req, res, next) => {
  try {
    await authService.logout(req.cookies.refreshToken);
    clearAuthCookies(res);
    res.status(204).send();
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

export default { signUpSuperAdmin, signUpViaInvite, login, refreshToken, logout };
