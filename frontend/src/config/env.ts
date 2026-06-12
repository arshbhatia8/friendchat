function requireEnv(key: string): string {
  const val = import.meta.env[key] as string | undefined;
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

export const env = {
  API_BASE_URL:         requireEnv("VITE_API_BASE_URL"),
  COMETCHAT_APP_ID:     requireEnv("VITE_COMETCHAT_APP_ID"),
  COMETCHAT_REGION:     requireEnv("VITE_COMETCHAT_REGION"),
  COMETCHAT_AUTH_KEY:   requireEnv("VITE_COMETCHAT_AUTH_KEY"),
} as const;
