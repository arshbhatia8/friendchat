import mongoose, {
  Schema, Document, Model, Types, CallbackError,
} from "mongoose";

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface IFriendRequest extends Document {
  senderId:     Types.ObjectId;
  receiverId:   Types.ObjectId;
  status:       FriendRequestStatus;
  respondedAt?: Date;
  createdAt:    Date;
  updatedAt:    Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    senderId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Sender is required"],
    },
    receiverId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Receiver is required"],
    },
    status: {
      type:    String,
      enum:    { values: ["PENDING", "ACCEPTED", "REJECTED"], message: "Invalid status" },
      default: "PENDING",
    },
    respondedAt: {
      type:    Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Compound unique: one (sender → receiver) row
friendRequestSchema.index(
  { senderId: 1, receiverId: 1 },
  { unique: true, name: "idx_unique_sender_receiver" }
);

// Hot path: "my incoming PENDING requests"
friendRequestSchema.index(
  { receiverId: 1, status: 1 },
  { name: "idx_receiver_status" }
);

friendRequestSchema.index({ senderId: 1 }, { name: "idx_sender" });

// Pre-save: block reverse-direction race (B→A while A→B is pending)
friendRequestSchema.pre<IFriendRequest>("save", async function (next) {
  if (!this.isNew) return next();
  try {
    const reverse = await FriendRequest.findOne({
      senderId:   this.receiverId,
      receiverId: this.senderId,
      status:     "PENDING",
    });
    if (reverse) {
      return next(
        new Error("A pending request already exists in the other direction") as CallbackError
      );
    }
    return next();
  } catch (e) {
    return next(e as CallbackError);
  }
});

export const FriendRequest: Model<IFriendRequest> =
  mongoose.models.FriendRequest ??
  mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);
