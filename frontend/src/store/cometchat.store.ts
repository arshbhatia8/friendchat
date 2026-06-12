import { create } from "zustand";

interface CometChatState {
  initialized: boolean;
  loggedIn:    boolean;
  authToken:   string | null;
  error:       string | null;

  setInitialized: (v: boolean) => void;
  setLoggedIn:    (v: boolean) => void;
  setAuthToken:   (t: string) => void;
  setError:       (e: string | null) => void;
  reset:          () => void;
}

export const useCometChatStore = create<CometChatState>()((set) => ({
  initialized: false,
  loggedIn:    false,
  authToken:   null,
  error:       null,

  setInitialized: (initialized) => set({ initialized }),
  setLoggedIn:    (loggedIn)    => set({ loggedIn }),
  setAuthToken:   (authToken)   => set({ authToken }),
  setError:       (error)       => set({ error }),
  reset: () => set({ initialized: false, loggedIn: false, authToken: null, error: null }),
}));
