import { StatusCodes } from "http-status-codes";
import { User, IUser } from "@models/User.model";
import { AppError } from "@utils/AppError";
import { signAccessToken, signRefreshToken } from "@utils/jwt";
import { provisionCometChatUser } from "@config/cometchat";

export interface RegisterInput {
  username:    string;
  email:       string;
  password:    string;
  displayName: string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthResult {
  user:   IUser;
  tokens: AuthTokens;
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { username, email, password, displayName } = input;

  // Check uniqueness before write — clear error message
  const exists = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (exists) {
    const field = (exists as { email?: string }).email === email ? "email" : "username";
    throw new AppError(`${field} is already taken`, StatusCodes.CONFLICT);
  }

  // Create user — pre-save hook hashes passwordHash
  const user = new User({
    username,
    email,
    passwordHash: password,   // will be hashed by pre-save hook
    displayName,
    cometChatUid: "",         // set after _id is known
  });
  await user.save();

  // Use _id as cometChatUid for a clean 1:1 mapping
  const uid         = (user._id as { toString(): string }).toString();
  user.cometChatUid = uid;
  await user.save();

  // Provision on CometChat — throws if this fails
  await provisionCometChatUser(uid, displayName);

  return { user, tokens: issueTokens(uid) };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  // Explicitly select passwordHash (select:false on schema)
  const user = await User.findOne({ email }).select("+passwordHash");

  // Identical error for "not found" and "wrong password" — prevents email enumeration
  if (!user) throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);

  const valid = await user.comparePassword(password);
  if (!valid)    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);

  if (!user.isActive) throw new AppError("Account is inactive", StatusCodes.FORBIDDEN);

  return { user, tokens: issueTokens(user._id.toString()) };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function issueTokens(userId: string): AuthTokens {
  return {
    accessToken:  signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  };
}
