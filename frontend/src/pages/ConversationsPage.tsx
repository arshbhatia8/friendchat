import { useEffect, useRef, useState } from "react";
import { useNavigate }          from "react-router-dom";
import { CometChat }            from "@cometchat/chat-sdk-javascript";
import { ConversationList }     from "@/components/chat/ConversationList";
import { ChatContainer }        from "@/components/chat/ChatContainer";
import { UIKitProvider }        from "@/components/chat/UIKitProvider";
import { SearchInput }          from "@/components/ui/SearchInput";
import { ErrorAlert }           from "@/components/ui/ErrorAlert";
import { ConversationListSkeleton } from "@/components/ui/Skeleton";
import { EmptyConversations }   from "@/components/ui/EmptyState";
import { useConversationsStore } from "@/store/conversations.store";
import { useCometChatStore }     from "@/store/cometchat.store";

const CONV_LISTENER = "CONV_LIST_REALTIME";

export function ConversationsPage() {
  const {
    conversations, loading, error,
    fetchConversations, updateLastMessage, incrementUnread, activeFriendUid,
  } = useConversationsStore();

  const { loggedIn, authToken } = useCometChatStore();
  const listenerMounted = useRef(false);
  const navigate        = useNavigate();

  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.displayName.toLowerCase().includes(search.toLowerCase()) ||
          c.username.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time: update sidebar on incoming messages
  useEffect(() => {
    if (!loggedIn || listenerMounted.current) return;
    listenerMounted.current = true;

    CometChat.addMessageListener(
      CONV_LISTENER,
      new CometChat.MessageListener({
        onTextMessageReceived: (msg: CometChat.TextMessage) => {
          const uid  = msg.getSender()?.getUid();
          const text = msg.getText() ?? "";
          if (!uid) return;
          updateLastMessage(uid, text);
          if (activeFriendUid !== uid) incrementUnread(uid);
        },
      })
    );
    return () => {
      CometChat.removeMessageListener(CONV_LISTENER);
      listenerMounted.current = false;
    };
  }, [loggedIn, activeFriendUid, updateLastMessage, incrementUnread]);

  return (
    <UIKitProvider authToken={authToken}>
      {/* On mobile: when a conversation is active, hide the list and show chat full-screen */}
      <div className="flex h-full">

        {/* ── Sidebar ── */}
        <aside
          className={[
            "flex flex-col border-r border-gray-100 bg-white",
            "w-full sm:w-72 flex-shrink-0",
            // Hide sidebar on mobile when a conversation is active
            activeFriendUid ? "hidden sm:flex" : "flex",
          ].join(" ")}
        >
          {/* Header */}
          <div className="page-header flex-shrink-0">
            <h1 className="text-base font-semibold text-ink">Messages</h1>
            {!loading && conversations.length > 0 && (
              <p className="text-xs text-ink-muted mt-0.5">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Search */}
          {conversations.length > 3 && (
            <div className="border-b border-gray-100 px-3 py-2.5">
              <SearchInput
                onChange={setSearch}
                placeholder="Search conversations…"
                className="w-full"
              />
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
            {loading && <ConversationListSkeleton />}

            {!loading && error && (
              <div className="px-3">
                <ErrorAlert message={error} onRetry={fetchConversations} size="sm" />
              </div>
            )}

            {!loading && !error && filtered.length === 0 && conversations.length === 0 && (
              <EmptyConversations onDiscover={() => navigate("/app/users")} />
            )}

            {!loading && !error && filtered.length === 0 && conversations.length > 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-ink-muted">No matches for "{search}"</p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <ConversationList conversations={filtered} loading={false} />
            )}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        <div
          className={[
            "flex flex-1 flex-col overflow-hidden min-w-0",
            // On mobile: only show when a conversation is active
            activeFriendUid ? "flex" : "hidden sm:flex",
          ].join(" ")}
        >
          <ChatContainer />
        </div>

      </div>
    </UIKitProvider>
  );
}
