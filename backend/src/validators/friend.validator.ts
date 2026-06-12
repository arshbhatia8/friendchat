import Joi from "joi";

const objectId = Joi.string()
  .pattern(/^[a-f\d]{24}$/i)
  .message("Must be a valid MongoDB ObjectId");

export const sendRequestSchema = Joi.object({
  receiverId: objectId.required(),
});

export const respondRequestSchema = Joi.object({
  requestId: objectId.required(),
});

export const friendIdParamSchema = Joi.object({
  friendId: objectId.required(),
});

export const chatTokenQuerySchema = Joi.object({
  with: objectId.required(),
});

export const sendMessageSchema = Joi.object({
  text: Joi.string().min(1).max(4096).required(),
});

export const messagesQuerySchema = Joi.object({
  limit:  Joi.number().integer().min(1).max(100).default(25),
  before: Joi.string().optional(),
});
