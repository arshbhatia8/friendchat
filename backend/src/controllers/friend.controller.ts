import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as friendService from "@services/friend.service";
import { sendSuccess } from "@utils/apiResponse";

export async function sendRequest(req: Request, res: Response): Promise<void> {
  const request = await friendService.sendFriendRequest(
    req.userId!,
    (req.body as { receiverId: string }).receiverId
  );
  sendSuccess(res, { request }, StatusCodes.CREATED, "Friend request sent");
}

export async function acceptRequest(req: Request, res: Response): Promise<void> {
  await friendService.acceptFriendRequest(
    req.userId!,
    (req.body as { requestId: string }).requestId
  );
  sendSuccess(res, null, StatusCodes.OK, "Friend request accepted");
}

export async function rejectRequest(req: Request, res: Response): Promise<void> {
  await friendService.rejectFriendRequest(
    req.userId!,
    (req.body as { requestId: string }).requestId
  );
  sendSuccess(res, null, StatusCodes.OK, "Friend request rejected");
}

export async function getIncomingRequests(req: Request, res: Response): Promise<void> {
  const requests = await friendService.getIncomingRequests(req.userId!);
  sendSuccess(res, { requests });
}

export async function listFriends(req: Request, res: Response): Promise<void> {
  const friends = await friendService.getFriends(req.userId!);
  sendSuccess(res, { friends });
}

export async function removeFriend(req: Request, res: Response): Promise<void> {
  await friendService.removeFriend(req.userId!, req.params.friendId);
  sendSuccess(res, null, StatusCodes.OK, "Friend removed");
}
