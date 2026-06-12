import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surface-subtle to-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg ring-4 ring-brand-100">
            <span className="text-xl font-bold text-white tracking-tight">FC</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-ink">FriendChat</p>
            <p className="text-xs text-ink-muted">Only chat with people you trust</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-modal border border-gray-100 p-7 sm:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-ink-faint">
          Messages are only shared between confirmed friends
        </p>
      </div>
    </div>
  );
}
