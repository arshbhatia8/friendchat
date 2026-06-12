import { apiClient } from "./api.client";
import { Conversation, ApiResponse } from "@/types/domain.types";

export const chatService = {
  async getSessionToken(): Promise<string> {
    const { data } = await apiClient.get<ApiResponse<{ authToken: string }>>(
      "/chat/session-token"
    );
    return data.data.authToken;
  },

  async getChatToken(friendId: string): Promise<string> {
    const { data } = await apiClient.get<ApiResponse<{ authToken: string }>>(
      `/chat/token?with=${friendId}`
    );
    return data.data.authToken;
  },

  async getConversations(): Promise<Conversation[]> {
    const { data } = await apiClient.get<ApiResponse<{ conversations: Conversation[] }>>(
      "/chat/conversations"
    );
    return data.data.conversations;
  },
};
