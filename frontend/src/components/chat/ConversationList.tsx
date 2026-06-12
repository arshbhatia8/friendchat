import { Avatar }       from "@/components/ui/Avatar";
import { useConversationsStore } from "@/store/conversations.store";
import { Conversation } from "@/types/domain.types";
import { formatRelativeTime } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

interface Props {
  conversations: Conversation[];
  loading:       boolean;
  onlineUids?:   Set<string>;
}

export function ConversationList({ conversations, onlineUids = new Set() }: Props) {
  const { activeFriendUid, setActive, clearUnread } = useConversationsStore();

  function handleSelect(convo: Conversation) {
    setActive(convo.cometChatUid);
    clearUnread(convo.cometChatUid);
  }

  return (
    <ul className="flex flex-col" role="list" aria-label="Conversations">
      {conversations.map((convo) => {
        const isActive  = activeFriendUid === convo.cometChatUid;
        const isOnline  = onlineUids.has(convo.cometChatUid);
        const hasUnread = (convo.unreadCount ?? 0) > 0;

        return (
          <li key={convo.friendId}>
            <button
              onClick={() => handleSelect(convo)}
              aria-current={isActive ? "true" : undefined}
              aria-label={`${convo.displayName}${hasUnread ? `, ${convo.unreadCount} unread` : ""}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl mx-1 text-left no-tap-highlight",
                "transition-colors duration-100",
                isActive
                  ? "bg-brand-50 text-brand-900"
                  : "hover:bg-surface-muted text-ink"
              )}
            >
              <Avatar
                name={convo.displayName}
                src={convo.avatarUrl}
                size="sm"
                isOnline={isOnline}
                className="flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={cn(
                    "text-sm truncate",
                    isActive ? "font-semibold text-brand-700" : hasUnread ? "font-semibold text-ink" : "font-medium text-ink"
                  )}>
                    {convo.displayName}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {convo.friendSince && !hasUnread && (
                      <span className="text-[10px] text-ink-faint hidden xs:block">
                        {formatRelativeTime(convo.friendSince)}
                      </span>
                    )}
                    {hasUnread && (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                        {(convo.unreadCount ?? 0) > 9 ? "9+" : convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {convo.lastMessage ? (
                  <p className={cn(
                    "text-xs truncate",
                    hasUnread ? "text-ink font-medium" : "text-ink-muted"
                  )}>
                    {convo.lastMessage}
                  </p>
                ) : (
                  <p className="text-xs text-ink-faint truncate italic">No messages yet</p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
