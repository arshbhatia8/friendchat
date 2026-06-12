import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { extractBearerToken, verifyAccessToken } from "@utils/jwt";
import { User } from "@models/User.model";
import { AppError } from "@utils/AppError";

export async function verifyToken(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) throw new AppError("No token provided", StatusCodes.UNAUTHORIZED);

  const payload = verifyAccessToken(token);   // throws if invalid/expired

  const user = await User.findById(payload.userId).select("+passwordHash");
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", StatusCodes.UNAUTHORIZED);
  }

  req.user   = user;
  req.userId = user._id.toString();
  next();
}
