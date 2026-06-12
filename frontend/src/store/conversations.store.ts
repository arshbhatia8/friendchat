import { create } from "zustand";
import { Conversation } from "@/types/domain.types";
import { chatService } from "@/services/chat.service";

interface ConversationsState {
  conversations:   Conversation[];
  activeFriendUid: string | null;
  loading:         boolean;
  error:           string | null;

  fetchConversations:  () => Promise<void>;
  setActive:           (uid: string | null) => void;
  updateLastMessage:   (uid: string, lastMessage: string) => void;
  incrementUnread:     (uid: string) => void;
  clearUnread:         (uid: string) => void;
}

export const useConversationsStore = create<ConversationsState>()((set) => ({
  conversations:   [],
  activeFriendUid: null,
  loading:         false,
  error:           null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations, loading: false });
    } catch {
      set({ error: "Failed to load conversations", loading: false });
    }
  },

  setActive: (uid) => set({ activeFriendUid: uid }),

  updateLastMessage: (uid, lastMessage) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.cometChatUid === uid
          ? { ...c, lastMessage }
          : c
      ),
    })),

  incrementUnread: (uid) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.cometChatUid === uid
          ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
          : c
      ),
    })),

  clearUnread: (uid) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.cometChatUid === uid ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
