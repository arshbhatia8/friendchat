import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import { AppError } from "@utils/AppError";

type ValidationTarget = "body" | "query" | "params";

export function validate(
  schema: Joi.ObjectSchema,
  target: ValidationTarget = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly:   false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      throw new AppError(message, StatusCodes.UNPROCESSABLE_ENTITY);
    }

    req[target] = value;
    next();
  };
}
