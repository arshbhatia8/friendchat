import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar }    from "@/components/ui/Avatar";
import { Button }    from "@/components/ui/Button";
import { useToast }  from "@/components/ui/Toast";
import { friendsService }        from "@/services/friends.service";
import { useUsersStore }         from "@/store/users.store";
import { useConversationsStore } from "@/store/conversations.store";
import { UserWithStatus, RelationshipStatus } from "@/types/domain.types";
import { cn }        from "@/utils/cn";

interface Props {
  entry:    UserWithStatus;
  isOnline?: boolean;
}

const statusConfig: Record<RelationshipStatus, { label: string; pill: string }> = {
  none:             { label: "",         pill: "" },
  pending_sent:     { label: "Pending",  pill: "bg-amber-50 text-amber-700 border border-amber-200" },
  pending_received: { label: "Respond",  pill: "bg-blue-50 text-blue-700 border border-blue-200" },
  friends:          { label: "Friends",  pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

export function UserCard({ entry, isOnline }: Props) {
  const { user, status } = entry;
  const [busy, setBusy]  = useState(false);

  const { updateStatus }  = useUsersStore();
  const { setActive }     = useConversationsStore();
  const navigate          = useNavigate();
  const toast             = useToast();

  async function sendRequest() {
    setBusy(true);
    try {
      await friendsService.sendRequest(user.id);
      updateStatus(user.id, "pending_sent");
      toast("Friend request sent!", "success");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? "Couldn't send request";
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  function openChat() {
    setActive(user.cometChatUid);
    navigate("/app");
  }

  const { label, pill } = statusConfig[status];

  return (
    <div className="card-hover flex items-center gap-3 p-4 group animate-fade-in">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar name={user.displayName} src={user.avatarUrl} size="md" isOnline={isOnline} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-ink truncate">{user.displayName}</p>
          {label && (
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0", pill)}>
              {label}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted truncate">@{user.username}</p>
        {isOnline !== undefined && (
          <p className={cn("text-xs mt-0.5", isOnline ? "text-emerald-600" : "text-ink-faint")}>
            {isOnline ? "● Online" : "○ Offline"}
          </p>
        )}
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {status === "none" && (
          <Button size="sm" onClick={sendRequest} loading={busy} className="opacity-70 group-hover:opacity-100 transition-opacity">
            Add friend
          </Button>
        )}
        {status === "pending_sent" && (
          <Button size="sm" variant="secondary" disabled className="cursor-default">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 mr-1 text-amber-500">
              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zm-.75 6.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"/>
            </svg>
            Pending
          </Button>
        )}
        {status === "pending_received" && (
          <Button size="sm" variant="secondary" onClick={() => navigate("/app/requests")}>
            Respond
          </Button>
        )}
        {status === "friends" && (
          <Button size="sm" variant="secondary" onClick={openChat}>
            Message
          </Button>
        )}
      </div>
    </div>
  );
}
