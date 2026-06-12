import { Response } from "express";

export function sendSuccess<T>(
  res:        Response,
  data:       T,
  statusCode  = 200,
  message?:   string
): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

export function sendError(
  res:       Response,
  error:     string,
  statusCode = 500,
  details?:  unknown
): Response {
  const body: Record<string, unknown> = { success: false, error };
  if (details !== undefined) body.details = details;
  return res.status(statusCode).json(body);
}
