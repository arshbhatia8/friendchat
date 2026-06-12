/** Returns a human-readable relative time string ("2 min ago", "3 days ago") */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/** Returns "HH:MM" time string */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
  });
}
