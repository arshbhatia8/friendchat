import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout }        from "@/layouts/AuthLayout";
import { AppLayout }         from "@/layouts/AppLayout";
import { ProtectedRoute }    from "./ProtectedRoute";
import { PublicRoute }       from "./PublicRoute";
import { LoginPage }         from "@/pages/LoginPage";
import { RegisterPage }      from "@/pages/RegisterPage";
import { UsersPage }         from "@/pages/UsersPage";
import { RequestsPage }      from "@/pages/RequestsPage";
import { ConversationsPage } from "@/pages/ConversationsPage";

export const router = createBrowserRouter([
  // ── Root redirect ─────────────────────────────────────────────────────────
  {
    path:    "/",
    element: <Navigate to="/app" replace />,
  },

  // ── Public routes (redirect to /app if already authenticated) ─────────────
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "login",    element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },

  // ── Protected routes (redirect to /login if not authenticated) ────────────
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,         element: <ConversationsPage /> },
      { path: "requests",    element: <RequestsPage /> },
      { path: "users",       element: <UsersPage /> },
    ],
  },

  // ── 404 fallback ──────────────────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/app" replace />,
  },
]);
