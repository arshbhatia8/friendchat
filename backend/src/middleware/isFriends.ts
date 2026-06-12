import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { areFriends } from "@utils/friendship";
import { AppError } from "@utils/AppError";

/**
 * Guards every /chat route.
 * Reads the target userId from req.params, req.body, or req.query (?with=).
 * Queries the Friendship collection — throws 403 if no confirmed friendship exists.
 *
 * This is the assignment's backend enforcement requirement. Even if the
 * frontend is bypassed or a valid JWT is obtained, access is blocked here
 * before CometChat is ever contacted.
 */
export async function isFriends(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const currentUserId = req.userId!;

  const targetUserId =
    (req.params.friendId as string | undefined) ??
    (req.params.userId   as string | undefined) ??
    (req.body?.receiverId as string | undefined) ??
    (req.query.with      as string | undefined);

  if (!targetUserId) {
    throw new AppError("Target user ID is required", StatusCodes.BAD_REQUEST);
  }

  if (currentUserId === targetUserId) {
    throw new AppError("Cannot chat with yourself", StatusCodes.BAD_REQUEST);
  }

  const friends = await areFriends(currentUserId, targetUserId);
  if (!friends) {
    throw new AppError("You can only chat with friends", StatusCodes.FORBIDDEN);
  }

  next();
}
