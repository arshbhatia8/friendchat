import { apiClient } from "./api.client";
import { UserWithStatus, ApiResponse } from "@/types/domain.types";

export const usersService = {
  async getAllUsers(): Promise<UserWithStatus[]> {
    const { data } = await apiClient.get<ApiResponse<{ users: UserWithStatus[] }>>("/users");
    return data.data.users;
  },
};
