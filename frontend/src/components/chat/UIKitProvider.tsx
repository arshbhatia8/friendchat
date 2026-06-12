import { useEffect, useState, ReactNode } from "react";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { Spinner } from "@/components/ui/Spinner";
import { env }    from "@/config/env";

interface Props {
  authToken: string | null;
  children:  ReactNode;
}

let _uiKitInitialized = false;

export function UIKitProvider({ authToken, children }: Props) {
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!authToken) return;
    let cancelled = false;

    async function init() {
      try {
        if (!_uiKitInitialized) {
          const settings = new UIKitSettingsBuilder()
            .setAppId(env.COMETCHAT_APP_ID)
            .setRegion(env.COMETCHAT_REGION)
            .setAuthKey(env.COMETCHAT_AUTH_KEY)
            .subscribePresenceForAllUsers()
            .build();

          await CometChatUIKit.init(settings);
          _uiKitInitialized = true;
        }

        const existing = await CometChatUIKit.getLoggedinUser();
        if (!existing) {
          await CometChatUIKit.login({ authToken });
        }

        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "UI Kit init failed");
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [authToken]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-muted">
        Chat initialisation failed: {error}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" className="text-brand-400" />
      </div>
    );
  }

  return <>{children}</>;
}
