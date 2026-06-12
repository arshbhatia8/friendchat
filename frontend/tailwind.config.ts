import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#1e1b4b",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle:  "#f8f9fb",
          muted:   "#f1f3f7",
          hover:   "#eceef4",
        },
        ink: {
          DEFAULT: "#111827",
          muted:   "#6b7280",
          faint:   "#9ca3af",
          ghost:   "#d1d5db",
        },
        success: { DEFAULT: "#10b981", light: "#d1fae5", dark: "#065f46" },
        warning: { DEFAULT: "#f59e0b", light: "#fef3c7", dark: "#78350f" },
        danger:  { DEFAULT: "#ef4444", light: "#fee2e2", dark: "#7f1d1d" },
        info:    { DEFAULT: "#3b82f6", light: "#dbeafe", dark: "#1e3a8a" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)",
        modal:  "0 20px 60px -10px rgb(0 0 0 / 0.15)",
        inner:  "inset 0 1px 2px 0 rgb(0 0 0 / 0.04)",
        glow:   "0 0 0 3px rgb(99 102 241 / 0.15)",
      },
      animation: {
        "fade-in":       "fadeIn 0.15s ease-out",
        "fade-out":      "fadeOut 0.15s ease-in",
        "slide-up":      "slideUp 0.2s ease-out",
        "slide-down":    "slideDown 0.2s ease-out",
        "slide-in-right":"slideInRight 0.25s ease-out",
        "scale-in":      "scaleIn 0.15s ease-out",
        "pulse-dot":     "pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer:         "shimmer 1.6s linear infinite",
        "spin-slow":     "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn:        { from: { opacity: "0" },                                    to: { opacity: "1" } },
        fadeOut:       { from: { opacity: "1" },                                    to: { opacity: "0" } },
        slideUp:       { from: { transform: "translateY(8px)", opacity: "0" },      to: { transform: "translateY(0)", opacity: "1" } },
        slideDown:     { from: { transform: "translateY(-8px)", opacity: "0" },     to: { transform: "translateY(0)", opacity: "1" } },
        slideInRight:  { from: { transform: "translateX(100%)", opacity: "0" },     to: { transform: "translateX(0)", opacity: "1" } },
        scaleIn:       { from: { transform: "scale(0.95)", opacity: "0" },          to: { transform: "scale(1)", opacity: "1" } },
        pulseDot:      { "0%,100%": { opacity: "1" },                               "50%": { opacity: "0.35" } },
        shimmer:       { from: { backgroundPosition: "-200% 0" },                   to: { backgroundPosition: "200% 0" } },
      },
      backgroundImage: {
        shimmer: "linear-gradient(90deg, transparent 25%, rgb(255 255 255 / 0.7) 50%, transparent 75%)",
        "shimmer-dark": "linear-gradient(90deg, transparent 25%, rgb(255 255 255 / 0.06) 50%, transparent 75%)",
      },
      backgroundSize: {
        shimmer: "200% 100%",
      },
      spacing: {
        "safe-top":    "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      screens: {
        xs: "480px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
