import { Types } from "mongoose";
import { Friendship } from "@models/Friendship.model";

export function canonicalPair(
  idA: string | Types.ObjectId,
  idB: string | Types.ObjectId
): [string, string] {
  const a = idA.toString();
  const b = idB.toString();
  return a < b ? [a, b] : [b, a];
}

export async function areFriends(
  userIdA: string | Types.ObjectId,
  userIdB: string | Types.ObjectId
): Promise<boolean> {
  const [a, b] = canonicalPair(userIdA, userIdB);
  const doc = await Friendship.findOne({ userAId: a, userBId: b }, { _id: 1 }).lean();
  return doc !== null;
}

export async function getFriendIds(
  userId: string | Types.ObjectId
): Promise<string[]> {
  const id  = userId.toString();
  const rows = await Friendship.find(
    { $or: [{ userAId: id }, { userBId: id }] },
    { userAId: 1, userBId: 1 }
  ).lean();
  return rows.map((r) =>
    r.userAId.toString() === id ? r.userBId.toString() : r.userAId.toString()
  );
}
