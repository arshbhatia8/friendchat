import { apiClient } from "./api.client";
import { Friend, FriendRequest, ApiResponse } from "@/types/domain.types";

export const friendsService = {
  async sendRequest(receiverId: string): Promise<FriendRequest> {
    const { data } = await apiClient.post<ApiResponse<{ request: FriendRequest }>>(
      "/friends/request",
      { receiverId }
    );
    return data.data.request;
  },

  async accept(requestId: string): Promise<void> {
    await apiClient.post("/friends/accept", { requestId });
  },

  async reject(requestId: string): Promise<void> {
    await apiClient.post("/friends/reject", { requestId });
  },

  async getIncoming(): Promise<FriendRequest[]> {
    const { data } = await apiClient.get<ApiResponse<{ requests: FriendRequest[] }>>(
      "/friends/requests"
    );
    return data.data.requests;
  },

  async list(): Promise<Friend[]> {
    const { data } = await apiClient.get<ApiResponse<{ friends: Friend[] }>>("/friends");
    return data.data.friends;
  },

  async remove(friendId: string): Promise<void> {
    await apiClient.delete(`/friends/${friendId}`);
  },
};
