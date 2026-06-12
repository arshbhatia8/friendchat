import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFriendship extends Document {
  userAId:          Types.ObjectId;   // always the lexicographically smaller ID
  userBId:          Types.ObjectId;
  friendRequestId?: Types.ObjectId;
  createdAt:        Date;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    userAId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    userBId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    friendRequestId: {
      type:    Schema.Types.ObjectId,
      ref:     "FriendRequest",
      default: undefined,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Primary lookup: areFriends() — single indexed hit
friendshipSchema.index(
  { userAId: 1, userBId: 1 },
  { unique: true, name: "idx_unique_friendship" }
);

// "List all friends of X" where X may be userBId
friendshipSchema.index({ userBId: 1 }, { name: "idx_user_b" });

// Pre-save: enforce canonical ordering (smaller ID always in userAId)
friendshipSchema.pre<IFriendship>("save", function (next) {
  if (!this.isNew) return next();
  const a = this.userAId.toString();
  const b = this.userBId.toString();
  if (a > b) {
    [this.userAId, this.userBId] = [this.userBId, this.userAId];
  }
  return next();
});

export const Friendship: Model<IFriendship> =
  mongoose.models.Friendship ??
  mongoose.model<IFriendship>("Friendship", friendshipSchema);
