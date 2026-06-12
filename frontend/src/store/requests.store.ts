import { create } from "zustand";
import { FriendRequest } from "@/types/domain.types";
import { friendsService } from "@/services/friends.service";

interface RequestsState {
  incoming:    FriendRequest[];
  unreadCount: number;
  loading:     boolean;
  error:       string | null;

  fetchRequests:    () => Promise<void>;
  addRequest:       (req: FriendRequest) => void;
  removeRequest:    (id: string) => void;
  incrementUnread:  () => void;
  clearUnread:      () => void;
  acceptRequest:    (requestId: string) => Promise<void>;
  rejectRequest:    (requestId: string) => Promise<void>;
}

export const useRequestsStore = create<RequestsState>()((set) => ({
  incoming:    [],
  unreadCount: 0,
  loading:     false,
  error:       null,

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const requests = await friendsService.getIncoming();
      set({ incoming: requests, loading: false });
    } catch {
      set({ error: "Failed to load requests", loading: false });
    }
  },

  addRequest: (req) =>
    set((s) => ({ incoming: [req, ...s.incoming] })),

  removeRequest: (id) =>
    set((s) => ({ incoming: s.incoming.filter((r) => r._id !== id) })),

  incrementUnread: () =>
    set((s) => ({ unreadCount: s.unreadCount + 1 })),

  clearUnread: () => set({ unreadCount: 0 }),

  acceptRequest: async (requestId) => {
    await friendsService.accept(requestId);
    set((s) => ({ incoming: s.incoming.filter((r) => r._id !== requestId) }));
  },

  rejectRequest: async (requestId) => {
    await friendsService.reject(requestId);
    set((s) => ({ incoming: s.incoming.filter((r) => r._id !== requestId) }));
  },
}));
