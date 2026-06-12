import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "@services/auth.service";
import { sendSuccess } from "@utils/apiResponse";
import { verifyRefreshToken } from "@utils/jwt";
import { signAccessToken } from "@utils/jwt";
import { User } from "@models/User.model";
import { AppError } from "@utils/AppError";
import { env } from "@config/env";

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge:   30 * 24 * 60 * 60 * 1000,   // 30 days in ms
};

export async function register(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.registerUser(req.body);
  res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTS);
  sendSuccess(res, { user, accessToken: tokens.accessToken }, StatusCodes.CREATED, "Registered");
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const { user, tokens }   = await authService.loginUser(email, password);
  res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTS);
  sendSuccess(res, { user, accessToken: tokens.accessToken }, StatusCodes.OK, "Logged in");
}

export async function getMe(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { user: req.user });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw new AppError("No refresh token", StatusCodes.UNAUTHORIZED);

  const payload  = verifyRefreshToken(token);
  const user     = await User.findById(payload.userId).lean();
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", StatusCodes.UNAUTHORIZED);
  }

  const accessToken = signAccessToken(user._id.toString());
  sendSuccess(res, { accessToken });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("refreshToken", COOKIE_OPTS);
  sendSuccess(res, null, StatusCodes.OK, "Logged out");
}
