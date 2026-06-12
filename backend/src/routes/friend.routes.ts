import { Router } from "express";
import * as ctrl from "@controllers/friend.controller";
import { verifyToken } from "@middleware/verifyToken";
import { validate }    from "@middleware/validate";
import {
  sendRequestSchema,
  respondRequestSchema,
  friendIdParamSchema,
} from "@validators/friend.validator";

const router = Router();

// All friend routes require authentication
router.use(verifyToken);

router.post(   "/request",        validate(sendRequestSchema),    ctrl.sendRequest);
router.post(   "/accept",         validate(respondRequestSchema), ctrl.acceptRequest);
router.post(   "/reject",         validate(respondRequestSchema), ctrl.rejectRequest);
router.get(    "/requests",                                        ctrl.getIncomingRequests);
router.get(    "/",                                                ctrl.listFriends);
router.delete( "/:friendId",      validate(friendIdParamSchema, "params"), ctrl.removeFriend);

export default router;
