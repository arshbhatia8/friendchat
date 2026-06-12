import { create } from "zustand";
import { UserWithStatus, RelationshipStatus } from "@/types/domain.types";
import { usersService } from "@/services/users.service";

interface UsersState {
  users:   UserWithStatus[];
  loading: boolean;
  error:   string | null;

  fetchUsers:   () => Promise<void>;
  updateStatus: (userId: string, status: RelationshipStatus) => void;
}

export const useUsersStore = create<UsersState>()((set) => ({
  users:   [],
  loading: false,
  error:   null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await usersService.getAllUsers();
      set({ users, loading: false });
    } catch {
      set({ error: "Failed to load users", loading: false });
    }
  },

  updateStatus: (userId, status) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.user.id === userId ? { ...u, status } : u
      ),
    })),
}));
