import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { AppError } from "@utils/AppError";
import { logger } from "@utils/logger";

export function errorHandler(
  err:  Error,
  req:  Request,
  res:  Response,
  _next: NextFunction
): void {
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    name:  err.name,
    stack: err.stack,
  });

  // ── AppError (operational) ──────────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // ── Mongoose duplicate key ──────────────────────────────────────────────────
  if ((err as NodeJS.ErrnoException).code === "11000") {
    const field = Object.keys(
      (err as mongoose.mongo.MongoServerError).keyValue ?? {}
    )[0];
    res.status(StatusCodes.CONFLICT).json({
      success: false,
      error:   `${field ?? "Field"} already exists`,
    });
    return;
  }

  // ── Mongoose validation ─────────────────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      error:   errors.join("; "),
    });
    return;
  }

  // ── Mongoose bad ObjectId ───────────────────────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error:   `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: "Invalid token" });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: "Token expired" });
    return;
  }

  // ── Fallback 500 ────────────────────────────────────────────────────────────
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error:   "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { detail: err.message }),
  });
}
