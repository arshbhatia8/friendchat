import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { tokenStorage } from "@/utils/tokenStorage";

export const apiClient = axios.create({
  baseURL:         env.API_BASE_URL,
  withCredentials: true,          // sends httpOnly refresh cookie
  timeout:         10_000,
  headers:         { "Content-Type": "application/json" },
});

// ── Request interceptor: inject access token ──────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: transparent token refresh on 401 ───────────────────

let _refreshing = false;
let _queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (_refreshing) {
      // Queue concurrent requests until refresh completes
      return new Promise((resolve) => {
        _queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    original._retry = true;
    _refreshing     = true;

    try {
      const { data } = await apiClient.post<{ data: { accessToken: string } }>(
        "/auth/refresh"
      );
      const newToken = data.data.accessToken;
      tokenStorage.set(newToken);
      _queue.forEach((cb) => cb(newToken));
      _queue       = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      tokenStorage.clear();
      _queue = [];
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      _refreshing = false;
    }
  }
);
