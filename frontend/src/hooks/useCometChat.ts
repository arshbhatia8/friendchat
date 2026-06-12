import { useEffect } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useCometChatStore } from "@/store/cometchat.store";
import { authService } from "@/services/auth.service";
import { env } from "@/config/env";

let _sdkInitialized = false;

export function useCometChat(isAuthenticated: boolean) {
  const { setInitialized, setLoggedIn, setAuthToken, setError, reset } =
    useCometChatStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function init() {
      try {
        // 1. Init SDK once
        if (!_sdkInitialized) {
          const settings = new CometChat.AppSettingsBuilder()
            .subscribePresenceForAllUsers()
            .setRegion(env.COMETCHAT_REGION)
            .autoEstablishSocketConnection(true)
            .build();
          await CometChat.init(env.COMETCHAT_APP_ID, settings);
          _sdkInitialized = true;
        }
        if (cancelled) return;
        setInitialized(true);

        // 2. Check for an existing session
        const existing = await CometChat.getLoggedinUser();
        if (existing) {
          if (!cancelled) setLoggedIn(true);
          return;
        }

        // 3. Get a fresh auth token from our backend
        const authToken = await authService.getSessionToken();
        if (cancelled) return;

        // 4. Log into CometChat
        await CometChat.login(authToken, env.COMETCHAT_AUTH_KEY);
        if (!cancelled) {
          setAuthToken(authToken);
          setLoggedIn(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "CometChat init failed");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      CometChat.logout().catch(() => undefined);
      reset();
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
}
