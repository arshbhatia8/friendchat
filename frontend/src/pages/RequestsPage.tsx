import { useEffect } from "react";
import { FriendRequestCard }          from "@/components/requests/FriendRequestCard";
import { EmptyRequests }              from "@/components/ui/EmptyState";
import { ErrorAlert }                 from "@/components/ui/ErrorAlert";
import { RequestCardSkeletonList }    from "@/components/ui/Skeleton";
import { useRequestsStore }           from "@/store/requests.store";

export function RequestsPage() {
  const { incoming, loading, error, unreadCount, fetchRequests, clearUnread } = useRequestsStore();

  useEffect(() => {
    fetchRequests();
    clearUnread();
  }, [fetchRequests, clearUnread]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="page-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-ink">Friend requests</h1>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 animate-scale-in items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-ink-muted">
              {loading
                ? "Loading…"
                : incoming.length > 0
                  ? `${incoming.length} pending request${incoming.length !== 1 ? "s" : ""}`
                  : "No pending requests"}
            </p>
          </div>
        </div>

        {/* Real-time indicator */}
        {!loading && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            Updates in real time
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 sm:px-6">
        {loading && <RequestCardSkeletonList count={3} />}

        {!loading && error && (
          <ErrorAlert
            title="Couldn't load requests"
            message={error}
            onRetry={fetchRequests}
          />
        )}

        {!loading && !error && incoming.length === 0 && <EmptyRequests />}

        {!loading && !error && incoming.length > 0 && (
          <div className="flex flex-col gap-3 max-w-xl">
            {incoming.map((req) => (
              <FriendRequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
