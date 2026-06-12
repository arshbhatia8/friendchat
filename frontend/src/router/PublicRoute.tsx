import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
