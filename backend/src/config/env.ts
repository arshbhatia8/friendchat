import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV:   optionalEnv("NODE_ENV", "development") as "development" | "production" | "test",
  PORT:       parseInt(optionalEnv("PORT", "5000"), 10),
  CLIENT_URL: optionalEnv("CLIENT_URL", "http://localhost:5173"),

  MONGODB_URI:      requireEnv("MONGODB_URI"),
  MONGODB_URI_TEST: optionalEnv("MONGODB_URI_TEST", "mongodb://localhost:27017/friendchat_test"),

  JWT_SECRET:             requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN:         optionalEnv("JWT_EXPIRES_IN", "7d"),
  JWT_REFRESH_SECRET:     requireEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: optionalEnv("JWT_REFRESH_EXPIRES_IN", "30d"),

  COMETCHAT_APP_ID:   requireEnv("COMETCHAT_APP_ID"),
  COMETCHAT_REGION:   optionalEnv("COMETCHAT_REGION", "us"),
  COMETCHAT_API_KEY:  requireEnv("COMETCHAT_API_KEY"),
  COMETCHAT_AUTH_KEY: requireEnv("COMETCHAT_AUTH_KEY"),

  RATE_LIMIT_WINDOW_MS:    parseInt(optionalEnv("RATE_LIMIT_WINDOW_MS", "900000"), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(optionalEnv("RATE_LIMIT_MAX_REQUESTS", "100"), 10),

  LOG_LEVEL: optionalEnv("LOG_LEVEL", "debug"),
} as const;
