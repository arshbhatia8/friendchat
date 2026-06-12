import { apiClient } from "./api.client";
import { AuthResult, User, ApiResponse } from "@/types/domain.types";

export const authService = {
  async register(input: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>("/auth/register", input);
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>("/auth/login", {
      email,
      password,
    });
    return data.data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
    return data.data.user;
  },

  async refresh(): Promise<string> {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh"
    );
    return data.data.accessToken;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getSessionToken(): Promise<string> {
    const { data } = await apiClient.get<ApiResponse<{ authToken: string }>>(
      "/chat/session-token"
    );
    return data.data.authToken;
  },
};
