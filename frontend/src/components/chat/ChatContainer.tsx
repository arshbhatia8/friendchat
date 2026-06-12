import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatMessages } from "@cometchat/chat-uikit-react";
import { Spinner }     from "@/components/ui/Spinner";
import { EmptyChat }   from "@/components/ui/EmptyState";
import { ErrorAlert }  from "@/components/ui/ErrorAlert";
import { Avatar }      from "@/components/ui/Avatar";
import { useConversationsStore } from "@/store/conversations.store";
import { useCometChatStore }     from "@/store/cometchat.store";

export function ChatContainer() {
  const { activeFriendUid, setActive, conversations } = useConversationsStore();
  const { loggedIn } = useCometChatStore();
  const [ccUser,   setCcUser]   = useState<CometChat.User | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [ccError,  setCcError]  = useState<string | null>(null);

  const activeConvo = conversations.find((c) => c.cometChatUid === activeFriendUid);

  useEffect(() => {
    if (!activeFriendUid || !loggedIn) { setCcUser(null); return; }
    let cancelled = false;
    setLoading(true);
    setCcError(null);

    CometChat.getUser(activeFriendUid)
      .then((user) => { if (!cancelled) setCcUser(user); })
      .catch(() => { if (!cancelled) setCcError("Couldn't connect to this conversation."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeFriendUid, loggedIn]);

  if (!activeFriendUid) {
    return (
      <div className="hidden sm:flex h-full items-center justify-center bg-surface-subtle">
        <EmptyChat />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Mobile-only header with back button */}
      <div className="flex sm:hidden items-center gap-3 border-b border-gray-100 bg-white px-3 py-3 flex-shrink-0">
        <button
          onClick={() => setActive(null)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted transition-colors no-tap-highlight"
          aria-label="Back to conversations"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        {activeConvo && (
          <div className="flex items-center gap-2.5">
            <Avatar name={activeConvo.displayName} src={activeConvo.avatarUrl} size="xs" />
            <div>
              <p className="text-sm font-semibold text-ink leading-tight">{activeConvo.displayName}</p>
              <p className="text-xs text-ink-muted">@{activeConvo.username}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" className="text-brand-400" />
          </div>
        )}

        {!loading && ccError && (
          <div className="flex h-full items-center justify-center p-6">
            <ErrorAlert title="Chat unavailable" message={ccError} />
          </div>
        )}

        {!loading && !ccError && ccUser && (
          <CometChatMessages user={ccUser} />
        )}
      </div>
    </div>
  );
}
