import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as chatService from "@services/chat.service";
import * as friendService from "@services/friend.service";
import { sendSuccess } from "@utils/apiResponse";

// Friendship already confirmed by isFriends() middleware — just issue the token
export async function getChatToken(req: Request, res: Response): Promise<void> {
  const authToken = await chatService.getChatAuthToken(req.user!.cometChatUid);
  sendSuccess(res, { authToken });
}

export async function getConversations(req: Request, res: Response): Promise<void> {
  const conversations = await friendService.getConversations(req.userId!);
  sendSuccess(res, { conversations });
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  const { friendId } = req.params;
  const { limit, before } = req.query as { limit?: string; before?: string };

  // isFriends() middleware has already confirmed friendship
  // Get the friend's cometChatUid
  const friends = await friendService.getFriends(req.userId!);
  const friend  = friends.find((f) => f._id.toString() === friendId);

  const result = await chatService.getMessageHistory(
    req.user!.cometChatUid,
    friend?.cometChatUid ?? friendId,
    limit ? parseInt(limit, 10) : 25,
    before
  );
  sendSuccess(res, result);
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { friendId } = req.params;
  const { text }     = req.body as { text: string };

  const friends = await friendService.getFriends(req.userId!);
  const friend  = friends.find((f) => f._id.toString() === friendId);

  const message = await chatService.sendMessage(
    req.user!.cometChatUid,
    friend?.cometChatUid ?? friendId,
    text
  );
  sendSuccess(res, { message }, StatusCodes.CREATED);
}
