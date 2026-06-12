import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username:     string;
  email:        string;
  passwordHash: string;
  displayName:  string;
  avatarUrl?:   string;
  cometChatUid: string;
  isActive:     boolean;
  createdAt:    Date;
  updatedAt:    Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type:      String,
      required:  [true, "Username is required"],
      unique:    true,
      trim:      true,
      minlength: [3,  "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      match:     [/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers and underscores"],
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
    },
    passwordHash: {
      type:     String,
      required: true,
      select:   false,
    },
    displayName: {
      type:      String,
      required:  [true, "Display name is required"],
      trim:      true,
      maxlength: [50, "Display name must be at most 50 characters"],
    },
    avatarUrl: {
      type:    String,
      default: null,
    },
    cometChatUid: {
      type:     String,
      required: true,
      unique:   true,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Partial index — only active users
userSchema.index(
  { isActive: 1 },
  { partialFilterExpression: { isActive: true }, name: "idx_active_users" }
);

// Pre-save: hash password only when modified
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt        = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Instance method: compare a plaintext candidate
userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
