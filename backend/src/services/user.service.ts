import { User, IUser } from "@models/User.model";
import { FriendRequest } from "@models/FriendRequest.model";
import { getFriendIds } from "@utils/friendship";

export type RelationshipStatus = "none" | "pending_sent" | "pending_received" | "friends";

export interface UserWithStatus {
  user:   IUser;
  status: RelationshipStatus;
}

export async function getAllUsersWithStatus(
  currentUserId: string
): Promise<UserWithStatus[]> {
  // Fetch all active users except caller
  const users = await User.find(
    { _id: { $ne: currentUserId }, isActive: true },
    { username: 1, displayName: 1, avatarUrl: 1, cometChatUid: 1, isActive: 1, createdAt: 1 }
  ).lean();

  // Three parallel DB queries for status enrichment
  const [friendIds, sentRequests, receivedRequests] = await Promise.all([
    getFriendIds(currentUserId),
    FriendRequest.find({ senderId: currentUserId, status: "PENDING" })
      .select("receiverId").lean(),
    FriendRequest.find({ receiverId: currentUserId, status: "PENDING" })
      .select("senderId").lean(),
  ]);

  const friendSet      = new Set(friendIds.map(String));
  const pendingSentSet = new Set(sentRequests.map((r) => r.receiverId.toString()));
  const pendingRecvSet = new Set(receivedRequests.map((r) => r.senderId.toString()));

  return users.map((u) => {
    const id = u._id.toString();
    let status: RelationshipStatus = "none";
    if (friendSet.has(id))        status = "friends";
    else if (pendingSentSet.has(id))   status = "pending_sent";
    else if (pendingRecvSet.has(id))   status = "pending_received";
    return { user: u as unknown as IUser, status };
  });
}
