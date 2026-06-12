export interface FriendRequestPayload {
  requestId:     string;
  senderId:      string;
  senderName:    string;
  senderAvatar?: string;
  createdAt:     string;
}

export interface FriendAcceptedPayload {
  friendshipId:  string;
  friendId:      string;
  friendName:    string;
  friendAvatar?: string;
}

export interface FriendRejectedPayload {
  requestId:  string;
  rejectedBy: string;
}

export interface ServerToClientEvents {
  "friend:request":  (payload: FriendRequestPayload)  => void;
  "friend:accepted": (payload: FriendAcceptedPayload) => void;
  "friend:rejected": (payload: FriendRejectedPayload) => void;
  "error":           (message: string) => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId:   string;
  username: string;
}
