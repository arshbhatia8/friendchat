import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Spinner }      from "@/components/ui/Spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, restoreSession } = useAuthStore();
  const location    = useLocation();
  const attempted   = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !loading && !attempted.current) {
      attempted.current = true;
      restoreSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" className="text-brand-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
