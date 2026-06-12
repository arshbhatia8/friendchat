import { cn } from "@/utils/cn";

// ── Primitive skeleton block ──────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

// ── UserCard skeleton ─────────────────────────────────────────────────────────

export function UserCardSkeleton() {
  return (
    <div className="card-hover flex items-center gap-4 p-4" aria-hidden="true">
      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg flex-shrink-0" />
    </div>
  );
}

export function UserCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── FriendRequestCard skeleton ────────────────────────────────────────────────

export function RequestCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-4" aria-hidden="true">
      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function RequestCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 max-w-xl">
      {Array.from({ length: count }).map((_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── ConversationItem skeleton ─────────────────────────────────────────────────

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3" aria-hidden="true">
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-2.5 w-36 rounded" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Chat message skeletons ────────────────────────────────────────────────────

export function MessageSkeleton({ align = "left" }: { align?: "left" | "right" }) {
  const isRight = align === "right";
  return (
    <div
      className={cn("flex items-end gap-2 px-4", isRight && "flex-row-reverse")}
      aria-hidden="true"
    >
      {!isRight && <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />}
      <div className={cn("space-y-1", isRight && "items-end flex flex-col")}>
        <Skeleton
          className={cn(
            "h-9 rounded-2xl",
            isRight ? "w-44 rounded-br-sm" : "w-52 rounded-bl-sm"
          )}
        />
        <Skeleton className="h-2.5 w-12 rounded" />
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <MessageSkeleton align="left" />
      <MessageSkeleton align="right" />
      <MessageSkeleton align="left" />
      <MessageSkeleton align="left" />
      <MessageSkeleton align="right" />
      <MessageSkeleton align="right" />
      <MessageSkeleton align="left" />
    </div>
  );
}

// ── Page-level full skeleton ──────────────────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-label="Loading…" role="status">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-6 py-4 space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-48 rounded" />
      </div>
      {/* Search bar */}
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <Skeleton className="h-9 w-72 rounded-lg" />
      </div>
      {/* Content */}
      <div className="flex-1 p-6">
        <UserCardSkeletonGrid />
      </div>
    </div>
  );
}
