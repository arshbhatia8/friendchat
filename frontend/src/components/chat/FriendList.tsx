/**
 * FriendList.tsx
 * ───────────────
 * Displays all confirmed friends with their online/offline presence status.
 * Clicking a friend opens their conversation in the ChatContainer.
 *
 * This component is used standalone (e.g. a future Friends page) or embedded
 * inside ConversationsPage as a fallback when no CometChat conversations exist
 * yet (i.e. the user has friends but no messages sent).
 */

import { useEffect } from "react";
import { CometChat }   from "@cometchat/chat-sdk-javascript";
import { Avatar }      from "@/components/ui/Avatar";
import { EmptyState }  from "@/components/ui/EmptyState";
import { Spinner }     from "@/components/ui/Spinner";
import { Button }      from "@/components/ui/Button";
import { useFriendsStore }       from "@/store/friends.store";
import { useConversationsStore } from "@/store/conversations.store";
import { useCometChatStore }     from "@/store/cometchat.store";
import { Friend }      from "@/types/domain.types";
import { cn }          from "@/utils/cn";
import { useState }    from "react";

const PRESENCE_LISTENER = "FRIEND_LIST_PRESENCE";

const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

export function FriendList() {
  const { friends, loading, fetchFriends } = useFriendsStore();
  const { setActive }     = useConversationsStore();
  const { loggedIn }      = useCometChatStore();
  const [onlineUids, setOnlineUids] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Register presence listener when CometChat is ready
  useEffect(() => {
    if (!loggedIn || !friends.length) return;

    // Fetch initial presence for all friends
    const uids = friends.map((f) => f.cometChatUid);
    const req   = new CometChat.UsersRequestBuilder()
      .setUIDs(uids)
      .setLimit(Math.min(uids.length, 100))
      .build();

    req.fetchNext().then((users) => {
      const online = new Set<string>();
      users.forEach((u) => {
        if (u.getStatus() === "online") online.add(u.getUid());
      });
      setOnlineUids(online);
    });

    // Real-time presence updates
    CometChat.addUserListener(
      PRESENCE_LISTENER,
      new CometChat.UserListener({
        onUserOnline:  (user: CometChat.User) =>
          setOnlineUids((prev) => new Set([...prev, user.getUid()])),
        onUserOffline: (user: CometChat.User) =>
          setOnlineUids((prev) => {
            const next = new Set(prev);
            next.delete(user.getUid());
            return next;
          }),
      })
    );

    return () => CometChat.removeUserListener(PRESENCE_LISTENER);
  }, [loggedIn, friends]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" className="text-brand-400" />
      </div>
    );
  }

  if (!friends.length) {
    return (
      <EmptyState
        icon={<PeopleIcon />}
        title="No friends yet"
        body="Accept a friend request to start chatting."
      />
    );
  }

  // Separate online from offline for ordering
  const online  = friends.filter((f) => onlineUids.has(f.cometChatUid));
  const offline = friends.filter((f) => !onlineUids.has(f.cometChatUid));
  const sorted  = [...online, ...offline];

  return (
    <div className="flex flex-col">
      {online.length > 0 && (
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          Online — {online.length}
        </p>
      )}
      {offline.length > 0 && online.length > 0 && (
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint mt-1">
          Offline — {offline.length}
        </p>
      )}
      <ul>
        {sorted.map((friend) => (
          <FriendRow
            key={friend.id}
            friend={friend}
            isOnline={onlineUids.has(friend.cometChatUid)}
            onMessage={() => setActive(friend.cometChatUid)}
          />
        ))}
      </ul>
    </div>
  );
}

// ── Friend row ────────────────────────────────────────────────────────────────

interface FriendRowProps {
  friend:    Friend;
  isOnline:  boolean;
  onMessage: () => void;
}

function FriendRow({ friend, isOnline, onMessage }: FriendRowProps) {
  return (
    <li>
      <button
        onClick={onMessage}
        className={cn(
          "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1",
          "text-left transition-colors duration-100 hover:bg-surface-muted"
        )}
      >
        <Avatar
          name={friend.displayName}
          src={friend.avatarUrl}
          size="sm"
          isOnline={isOnline}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{friend.displayName}</p>
          <p className="text-xs text-ink-muted truncate">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onMessage(); }}
        >
          Message
        </Button>
      </button>
    </li>
  );
}
