import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      // Target modern browsers — reduces bundle size significantly
      target: "es2020",

      // Warn when any chunk exceeds 500KB
      chunkSizeWarningLimit: 500,

      rollupOptions: {
        output: {
          // Manual chunk splitting — keeps CometChat separate from app code
          // so users only re-download what changed on each deploy
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-cometchat": [
              "@cometchat/chat-sdk-javascript",
              "@cometchat/chat-uikit-react",
            ],
            "vendor-utils": ["axios", "zustand", "clsx", "tailwind-merge"],
          },
          // Deterministic file names for long-term caching
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },

      // Generate sourcemaps for production error tracking
      // Set to false if you don't want sourcemaps exposed in the browser
      sourcemap: true,

      // Minify with esbuild (default) — fast and effective
      minify: "esbuild",
    },

    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL ?? "http://localhost:5000",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },

    preview: {
      port: 4173,
    },

    // Suppress CometChat peer dep warnings
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@cometchat/chat-sdk-javascript",
        "@cometchat/chat-uikit-react",
        "axios",
        "zustand",
      ],
    },
  };
});
