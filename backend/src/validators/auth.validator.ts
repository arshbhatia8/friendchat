import Joi from "joi";

export const registerSchema = Joi.object({
  username:    Joi.string().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(30).required()
                  .messages({ "string.pattern.base": "Username may only contain letters, numbers and underscores" }),
  email:       Joi.string().email().required(),
  password:    Joi.string().min(8).max(72).required(),
  displayName: Joi.string().min(2).max(50).trim().required(),
});

export const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
