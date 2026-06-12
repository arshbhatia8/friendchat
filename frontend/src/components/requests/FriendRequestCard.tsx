import { useState } from "react";
import { Avatar }    from "@/components/ui/Avatar";
import { Button }    from "@/components/ui/Button";
import { useToast }  from "@/components/ui/Toast";
import { useRequestsStore } from "@/store/requests.store";
import { useFriendsStore }  from "@/store/friends.store";
import { useUsersStore }    from "@/store/users.store";
import { FriendRequest }    from "@/types/domain.types";
import { formatRelativeTime } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

interface Props { request: FriendRequest }

export function FriendRequestCard({ request }: Props) {
  const [busy,    setBusy]    = useState<"accept" | "reject" | null>(null);
  const [settled, setSettled] = useState<"accepted" | "rejected" | null>(null);

  const { acceptRequest, rejectRequest } = useRequestsStore();
  const { addFriend }    = useFriendsStore();
  const { updateStatus } = useUsersStore();
  const toast            = useToast();
  const sender           = request.senderId;

  async function handleAccept() {
    setBusy("accept");
    try {
      await acceptRequest(request._id);
      addFriend(sender);
      updateStatus(sender.id, "friends");
      setSettled("accepted");
      toast(`You and ${sender.displayName} are now friends`, "success");
    } catch {
      toast("Couldn't accept request — try again", "error");
      setBusy(null);
    }
  }

  async function handleReject() {
    setBusy("reject");
    try {
      await rejectRequest(request._id);
      updateStatus(sender.id, "none");
      setSettled("rejected");
      toast("Request declined", "info");
    } catch {
      toast("Couldn't decline request — try again", "error");
      setBusy(null);
    }
  }

  // Collapsed confirmation state
  if (settled) {
    return (
      <div className={cn(
        "card flex items-center gap-3 px-4 py-3 animate-fade-in",
        settled === "accepted" ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-surface-subtle"
      )}>
        <div className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm",
          settled === "accepted" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-ink-muted"
        )}>
          {settled === "accepted" ? "✓" : "✕"}
        </div>
        <p className="text-sm text-ink-muted">
          {settled === "accepted"
            ? `You're now friends with ${sender.displayName}`
            : `Request from ${sender.displayName} declined`}
        </p>
      </div>
    );
  }

  return (
    <div className="card flex items-center gap-4 p-4 animate-fade-in hover:shadow-card-hover transition-shadow">
      <Avatar name={sender.displayName} src={sender.avatarUrl} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{sender.displayName}</p>
        <p className="text-xs text-ink-muted">
          @{sender.username} · {formatRelativeTime(request.createdAt)}
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="danger"
          onClick={handleReject}
          loading={busy === "reject"}
          disabled={busy !== null}
          aria-label={`Decline request from ${sender.displayName}`}
        >
          Decline
        </Button>
        <Button
          size="sm"
          onClick={handleAccept}
          loading={busy === "accept"}
          disabled={busy !== null}
          aria-label={`Accept request from ${sender.displayName}`}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
