import { create } from "zustand";
import { Friend } from "@/types/domain.types";
import { friendsService } from "@/services/friends.service";

interface FriendsState {
  friends: Friend[];
  loading: boolean;
  error:   string | null;

  fetchFriends: () => Promise<void>;
  addFriend:    (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
}

export const useFriendsStore = create<FriendsState>()((set) => ({
  friends: [],
  loading: false,
  error:   null,

  fetchFriends: async () => {
    set({ loading: true, error: null });
    try {
      const friends = await friendsService.list();
      set({ friends, loading: false });
    } catch {
      set({ error: "Failed to load friends", loading: false });
    }
  },

  addFriend: (friend) =>
    set((s) => ({ friends: [friend, ...s.friends] })),

  removeFriend: (friendId) =>
    set((s) => ({ friends: s.friends.filter((f) => f.id !== friendId) })),
}));
