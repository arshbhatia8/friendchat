import { create } from "zustand";
import { User } from "@/types/domain.types";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/utils/tokenStorage";

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  loading:         boolean;
  error:           string | null;

  login:          (email: string, password: string) => Promise<void>;
  register:       (input: { username: string; email: string; password: string; displayName: string }) => Promise<void>;
  logout:         () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError:     () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user:            null,
  isAuthenticated: false,
  loading:         false,
  error:           null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, accessToken } = await authService.login(email, password);
      tokenStorage.set(accessToken);
      set({ user, isAuthenticated: true, loading: false });
    } catch (err: unknown) {
      const message = extractError(err, "Login failed");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (input) => {
    set({ loading: true, error: null });
    try {
      const { user, accessToken } = await authService.register(input);
      tokenStorage.set(accessToken);
      set({ user, isAuthenticated: true, loading: false });
    } catch (err: unknown) {
      const message = extractError(err, "Registration failed");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    set({ loading: true });
    try {
      const token = await authService.refresh();
      tokenStorage.set(token);
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, loading: false });
    } catch {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

function extractError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { error?: string } } }).response;
    return r?.data?.error ?? fallback;
  }
  return fallback;
}
