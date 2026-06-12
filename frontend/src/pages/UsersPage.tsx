import { useEffect, useState, useCallback } from "react";
import { UserCard }             from "@/components/users/UserCard";
import { SearchInput }          from "@/components/ui/SearchInput";
import { EmptyUsers }           from "@/components/ui/EmptyState";
import { ErrorAlert }           from "@/components/ui/ErrorAlert";
import { UserCardSkeletonGrid } from "@/components/ui/Skeleton";
import { useUsersStore }        from "@/store/users.store";

export function UsersPage() {
  const { users, loading, error, fetchUsers } = useUsersStore();
  const [query, setQuery] = useState("");

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = query.trim()
    ? users.filter((u) =>
        u.user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.user.username.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  const handleSearch = useCallback((val: string) => setQuery(val), []);

  const counts = {
    friends:  users.filter((u) => u.status === "friends").length,
    pending:  users.filter((u) => u.status === "pending_sent" || u.status === "pending_received").length,
    discover: users.filter((u) => u.status === "none").length,
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="page-header flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base font-semibold text-ink">Discover people</h1>
            <p className="text-sm text-ink-muted">
              {loading ? "Loading…" : `${users.length} member${users.length !== 1 ? "s" : ""} on this app`}
            </p>
          </div>

          {/* Quick stats */}
          {!loading && users.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
              {counts.friends > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {counts.friends} friend{counts.friends !== 1 ? "s" : ""}
                </span>
              )}
              {counts.pending > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {counts.pending} pending
                </span>
              )}
              {counts.discover > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                  {counts.discover} to discover
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-3">
          <SearchInput
            onChange={handleSearch}
            placeholder="Search by name or username…"
            className="max-w-sm"
            aria-label="Search users"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 sm:px-6">
        {loading && <UserCardSkeletonGrid count={8} />}

        {!loading && error && (
          <ErrorAlert
            title="Couldn't load people"
            message={error}
            onRetry={fetchUsers}
          />
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyUsers query={query} />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((entry) => (
              <UserCard key={entry.user.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
