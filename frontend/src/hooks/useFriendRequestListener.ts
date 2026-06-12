import { useEffect } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useRequestsStore } from "@/store/requests.store";
import { useFriendsStore } from "@/store/friends.store";
import { useUsersStore } from "@/store/users.store";
import { useCometChatStore } from "@/store/cometchat.store";

const LISTENER_ID = "FRIEND_REQUEST_GLOBAL_LISTENER";

export function useFriendRequestListener() {
  const { loggedIn } = useCometChatStore();
  const { addRequest, incrementUnread } = useRequestsStore();
  const { addFriend } = useFriendsStore();
  const { updateStatus } = useUsersStore();

  useEffect(() => {
    if (!loggedIn) return;

    CometChat.addMessageListener(
      LISTENER_ID,
      new CometChat.MessageListener({
        onCustomMessageReceived: (message: CometChat.CustomMessage) => {
          const type       = message.getType();
          const customData = message.getCustomData() as Record<string, unknown>;

          if (type === "FRIEND_REQUEST") {
            // Build a minimal FriendRequest shape for the store
            const sender = message.getSender() as CometChat.User;
            const fakeReq = {
              _id:       customData.requestId as string,
              status:    "PENDING" as const,
              createdAt: new Date().toISOString(),
              senderId:  {
                id:          sender.getUid(),
                username:    sender.getName(),
                displayName: sender.getName(),
                avatarUrl:   sender.getAvatar() ?? null,
                email:       "",
                cometChatUid:sender.getUid(),
                isActive:    true,
                createdAt:   new Date().toISOString(),
              },
              receiverId: "",
            };
            addRequest(fakeReq);
            incrementUnread();

            // Update Users page status for this sender
            updateStatus(customData.senderId as string, "pending_received");
          }

          if (type === "FRIEND_ACCEPTED") {
            // Update relationships — the service layer has already created the Friendship
            updateStatus(customData.friendId as string, "friends");
            addFriend({
              id:           customData.friendId   as string,
              username:     customData.friendName as string,
              displayName:  customData.friendName as string,
              avatarUrl:    (customData.friendAvatar as string) ?? null,
              email:        "",
              cometChatUid: customData.friendId   as string,
              isActive:     true,
              createdAt:    new Date().toISOString(),
            });
          }
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(LISTENER_ID);
    };
  }, [loggedIn]); // eslint-disable-line react-hooks/exhaustive-deps
}
