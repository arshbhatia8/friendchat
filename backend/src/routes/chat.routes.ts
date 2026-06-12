import { Router } from "express";
import * as ctrl from "@controllers/chat.controller";
import { verifyToken } from "@middleware/verifyToken";
import { isFriends }   from "@middleware/isFriends";
import { validate }    from "@middleware/validate";
import {
  friendIdParamSchema,
  sendMessageSchema,
  messagesQuerySchema,
} from "@validators/friend.validator";

const router = Router();

// All chat routes require a valid JWT
router.use(verifyToken);

// GET /chat/token?with=<userId>
// verifyToken → isFriends (reads ?with param) → getChatToken
router.get("/token", isFriends, ctrl.getChatToken);

// GET /chat/conversations — filtered to confirmed friends only
router.get("/conversations", ctrl.getConversations);

// GET  /chat/messages/:friendId
// POST /chat/messages/:friendId
router.get(
  "/messages/:friendId",
  validate(friendIdParamSchema, "params"),
  validate(messagesQuerySchema, "query"),
  isFriends,
  ctrl.getMessages
);

router.post(
  "/messages/:friendId",
  validate(friendIdParamSchema, "params"),
  validate(sendMessageSchema),
  isFriends,
  ctrl.sendMessage
);

export default router;
