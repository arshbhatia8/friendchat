import { Outlet } from "react-router-dom";
import { Sidebar }  from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/auth.store";
import { useCometChat } from "@/hooks/useCometChat";
import { useFriendRequestListener } from "@/hooks/useFriendRequestListener";

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  useCometChat(isAuthenticated);
  useFriendRequestListener();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-subtle">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — extra bottom padding on mobile for the bottom nav */}
      <main className="flex-1 overflow-hidden min-w-0 pb-[env(safe-area-inset-bottom)] sm:pb-0">
        {/* On mobile, add bottom padding for the fixed bottom nav (64px) */}
        <div className="h-full pb-16 sm:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
