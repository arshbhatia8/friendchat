import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { FriendRequest, IFriendRequest } from "@models/FriendRequest.model";
import { Friendship } from "@models/Friendship.model";
import { User, IUser } from "@models/User.model";
import { AppError } from "@utils/AppError";
import { areFriends, canonicalPair, getFriendIds } from "@utils/friendship";
import { sendCometChatCustomMessage } from "@config/cometchat";
import { getSocketServer } from "@sockets/index";

// ── Send friend request ───────────────────────────────────────────────────────

export async function sendFriendRequest(
  senderId:   string,
  receiverId: string
): Promise<IFriendRequest> {
  if (senderId === receiverId) {
    throw new AppError("Cannot send a friend request to yourself", StatusCodes.BAD_REQUEST);
  }

  const receiver = await User.findById(receiverId).lean();
  if (!receiver)  throw new AppError("User not found", StatusCodes.NOT_FOUND);

  if (await areFriends(senderId, receiverId)) {
    throw new AppError("You are already friends", StatusCodes.CONFLICT);
  }

  // Check for any existing request in either direction
  const existing = await FriendRequest.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  });

  if (existing) {
    if (existing.status === "PENDING") {
      throw new AppError("A pending request already exists", StatusCodes.CONFLICT);
    }
    if (existing.status === "ACCEPTED") {
      throw new AppError("You are already friends", StatusCodes.CONFLICT);
    }
    // REJECTED — allow re-request by resetting the existing row
    existing.status      = "PENDING";
    existing.respondedAt = undefined;
    existing.senderId    = new Types.ObjectId(senderId);
    existing.receiverId  = new Types.ObjectId(receiverId);
    await existing.save();
    await deliverFriendRequestNotification(existing, senderId, receiver);
    return existing;
  }

  const request = await FriendRequest.create({ senderId, receiverId });
  await deliverFriendRequestNotification(request, senderId, receiver);
  return request;
}

// ── Accept ────────────────────────────────────────────────────────────────────

export async function acceptFriendRequest(
  receiverId: string,
  requestId:  string
): Promise<void> {
  const request = await FriendRequest.findById(requestId);
  if (!request)  throw new AppError("Request not found", StatusCodes.NOT_FOUND);

  if (request.receiverId.toString() !== receiverId) {
    throw new AppError("Not authorised", StatusCodes.FORBIDDEN);
  }
  if (request.status !== "PENDING") {
    throw new AppError("Request is no longer pending", StatusCodes.CONFLICT);
  }

  // Create the Friendship with canonical ordering
  const [userAId, userBId] = canonicalPair(request.senderId, request.receiverId);
  await Friendship.create({ userAId, userBId, friendRequestId: request._id });

  request.status      = "ACCEPTED";
  request.respondedAt = new Date();
  await request.save();

  // Notify the original sender via Socket.IO
  const receiver = await User.findById(receiverId).lean();
  const io        = getSocketServer();
  io.to(request.senderId.toString()).emit("friend:accepted", {
    friendshipId: `${userAId}_${userBId}`,
    friendId:     receiverId,
    friendName:   receiver?.displayName ?? "",
    friendAvatar: receiver?.avatarUrl ?? undefined,
  });
}

// ── Reject ────────────────────────────────────────────────────────────────────

export async function rejectFriendRequest(
  receiverId: string,
  requestId:  string
): Promise<void> {
  const request = await FriendRequest.findById(requestId);
  if (!request)  throw new AppError("Request not found", StatusCodes.NOT_FOUND);

  if (request.receiverId.toString() !== receiverId) {
    throw new AppError("Not authorised", StatusCodes.FORBIDDEN);
  }
  if (request.status !== "PENDING") {
    throw new AppError("Request is no longer pending", StatusCodes.CONFLICT);
  }

  request.status      = "REJECTED";
  request.respondedAt = new Date();
  await request.save();

  const io = getSocketServer();
  io.to(request.senderId.toString()).emit("friend:rejected", {
    requestId,
    rejectedBy: receiverId,
  });
}

// ── Read operations ───────────────────────────────────────────────────────────

export async function getIncomingRequests(userId: string): Promise<IFriendRequest[]> {
  return FriendRequest.find({ receiverId: userId, status: "PENDING" })
    .populate("senderId", "username displayName avatarUrl")
    .sort({ createdAt: -1 });
}

export async function getFriends(userId: string): Promise<IUser[]> {
  const friendIds = await getFriendIds(userId);
  return User.find(
    { _id: { $in: friendIds }, isActive: true },
    { username: 1, displayName: 1, avatarUrl: 1, cometChatUid: 1, isActive: 1 }
  ).sort({ displayName: 1 });
}

export async function removeFriend(
  userId:   string,
  friendId: string
): Promise<void> {
  const [userAId, userBId] = canonicalPair(userId, friendId);
  const result = await Friendship.findOneAndDelete({ userAId, userBId });
  if (!result) throw new AppError("Friendship not found", StatusCodes.NOT_FOUND);
}

export async function getConversations(userId: string) {
  const friendIds = await getFriendIds(userId);
  if (!friendIds.length) return [];

  const friendships = await Friendship.find({
    $or: [
      { userAId: { $in: friendIds.concat(userId) }, userBId: userId },
      { userAId: userId, userBId: { $in: friendIds } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  const friends = await User.find(
    { _id: { $in: friendIds }, isActive: true },
    { username: 1, displayName: 1, avatarUrl: 1, cometChatUid: 1 }
  ).lean();

  const friendMap = new Map(friends.map((f) => [f._id.toString(), f]));

  return friendships
    .map((fs) => {
      const friendId =
        fs.userAId.toString() === userId
          ? fs.userBId.toString()
          : fs.userAId.toString();
      const friend = friendMap.get(friendId);
      if (!friend) return null;
      return {
        friendId:     friendId,
        username:     friend.username,
        displayName:  friend.displayName,
        avatarUrl:    friend.avatarUrl ?? null,
        cometChatUid: friend.cometChatUid,
        friendSince:  fs.createdAt,
      };
    })
    .filter(Boolean);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function deliverFriendRequestNotification(
  request:  IFriendRequest,
  senderId: string,
  receiver: { cometChatUid: string }
): Promise<void> {
  const sender = await User.findById(senderId).lean();
  if (!sender) return;

  await sendCometChatCustomMessage(
    sender.cometChatUid,
    receiver.cometChatUid,
    "FRIEND_REQUEST",
    {
      requestId:    request._id.toString(),
      senderId:     senderId,
      senderName:   sender.displayName,
      senderAvatar: sender.avatarUrl ?? null,
    }
  );
}
