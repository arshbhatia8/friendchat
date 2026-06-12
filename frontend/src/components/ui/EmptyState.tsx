import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?:      ReactNode;
  title:      string;
  body?:      string;
  action?:    ReactNode;
  className?: string;
  compact?:   boolean;
}

export function EmptyState({ icon, title, body, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-10 px-4" : "gap-4 py-16 px-6",
        className
      )}
      role="status"
    >
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-2xl bg-surface-muted text-ink-faint",
          compact ? "h-12 w-12 [&>svg]:h-6 [&>svg]:w-6" : "h-16 w-16 [&>svg]:h-8 [&>svg]:w-8"
        )}>
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-base")}>{title}</p>
        {body && (
          <p className={cn("text-ink-muted max-w-xs", compact ? "text-xs" : "text-sm")}>{body}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/* ── Pre-built illustrated empty states ──────────────────────────────────── */

export function EmptyConversations({ onDiscover }: { onDiscover?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      }
      title="No conversations yet"
      body="Add friends to start chatting. Your messages will only be visible to you and your friends."
      action={
        onDiscover ? (
          <button
            onClick={onDiscover}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Find people
          </button>
        ) : undefined
      }
    />
  );
}

export function EmptyRequests() {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
        </svg>
      }
      title="Inbox is empty"
      body="When someone sends you a friend request it will appear here in real time — no refresh needed."
    />
  );
}

export function EmptyUsers({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      }
      title={query ? `No results for "${query}"` : "No people to discover"}
      body={query ? "Try a different name or username." : "You're the first one here. Invite someone to join."}
    />
  );
}

export function EmptyChat() {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      }
      title="Select a conversation"
      body="Choose a friend from the sidebar to start chatting."
    />
  );
}
