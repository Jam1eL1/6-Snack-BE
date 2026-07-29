import { Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
} from "../constants/auth.constants";
import { clearAuthCookies, setAuthCookies } from "./authCookie.utils";

describe("authCookie.utils", () => {
  it("sets access and refresh cookies with their required options", () => {
    const res = {
      cookie: jest.fn(),
    } as unknown as Response;

    setAuthCookies(res, "access-token", "refresh-token");

    expect(res.cookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "access-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
      }),
    );
    expect(res.cookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "refresh-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/auth",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
      }),
    );
  });

  it("clears both cookies with their matching paths", () => {
    const res = {
      clearCookie: jest.fn(),
    } as unknown as Response;

    clearAuthCookies(res);

    expect(res.clearCookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      expect.objectContaining({ path: "/" }),
    );
    expect(res.clearCookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      expect.objectContaining({ path: "/auth" }),
    );
  });
});
