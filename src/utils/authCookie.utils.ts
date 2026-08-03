import { CookieOptions, Response } from "express";
import { ACCESS_TOKEN_COOKIE_MAX_AGE_MS, REFRESH_TOKEN_COOKIE_MAX_AGE_MS } from "../constants/auth.constants";

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  domain: isProduction ? ".sn8ck.com" : undefined,
};

const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/",
};

const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/auth",
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie("accessToken", accessToken, {
    ...accessTokenCookieOptions,
    maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
  });

  res.cookie("refreshToken", refreshToken, {
    ...refreshTokenCookieOptions,
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  });
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);
};

export { setAuthCookies, clearAuthCookies };
