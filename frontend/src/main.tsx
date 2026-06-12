import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * main.tsx
 * ─────────
 * Vite entry point. Mounts the React tree into #root.
 *
 * StrictMode is intentionally kept — it double-invokes effects in development
 * to surface accidental side effects. Our stores and hooks handle this cleanly.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
