// ── Core domain types matching the backend's response shapes ──────────────────

export interface User {
  id:           string;
  username:     string;
  email:        string;
  displayName:  string;
  avatarUrl:    string | null;
  cometChatUid: string;
  isActive:     boolean;
  createdAt:    string;
}

export type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends";

export interface UserWithStatus {
  user:   User;
  status: RelationshipStatus;
}

export interface FriendRequest {
  _id:        string;
  status:     "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt:  string;
  respondedAt?: string;
  senderId:   User;      // populated
  receiverId: string;
}

export interface Friend extends User {
  // same shape as User, aliased for clarity
}

export interface Conversation {
  friendId:     string;
  username:     string;
  displayName:  string;
  avatarUrl:    string | null;
  cometChatUid: string;
  friendSince:  string;
  lastMessage?: string;
  unreadCount?: number;
}

// ── API envelope ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data:    T;
}

export interface ApiError {
  success: false;
  error:   string;
  details?: unknown;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResult {
  user:        User;
  accessToken: string;
}
