import { NavLink, useNavigate } from "react-router-dom";
import { Avatar }    from "@/components/ui/Avatar";
import { useAuthStore }     from "@/store/auth.store";
import { useRequestsStore } from "@/store/requests.store";
import { cn } from "@/utils/cn";

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const RequestsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4.5 w-4.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const navItems = [
  { to: "/app",          label: "Chats",    Icon: ChatIcon,     end: true  },
  { to: "/app/requests", label: "Requests", Icon: RequestsIcon, end: false },
  { to: "/app/users",    label: "Discover", Icon: UsersIcon,    end: false },
];

// ── Desktop vertical sidebar ──────────────────────────────────────────────────

export function Sidebar() {
  const { user, logout }  = useAuthStore();
  const { unreadCount }   = useRequestsStore();
  const navigate          = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden sm:flex h-full w-[68px] flex-col items-center border-r border-gray-100 bg-white py-4 gap-1 flex-shrink-0">
        {/* Logo */}
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
          <span className="text-xs font-bold text-white tracking-tight">FC</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-1 flex-1" aria-label="Main navigation">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150",
                  "no-tap-highlight",
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                )
              }
            >
              <Icon />
              {label === "Requests" && unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2 mt-2">
          {user && (
            <div title={user.displayName}>
              <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors duration-150 no-tap-highlight"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav (hidden on sm+) ── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-gray-100 bg-white px-2 pb-safe-bottom"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        aria-label="Main navigation"
      >
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl no-tap-highlight",
                "transition-colors duration-150 min-w-0",
                isActive ? "text-brand-600" : "text-ink-muted"
              )
            }
          >
            <Icon />
            <span className="text-[10px] font-medium">{label}</span>
            {label === "Requests" && unreadCount > 0 && (
              <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
        {/* Mobile: logout in nav */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-ink-muted no-tap-highlight"
          aria-label="Sign out"
        >
          <LogoutIcon />
          <span className="text-[10px] font-medium">Out</span>
        </button>
      </nav>
    </>
  );
}
