import { generateCometChatAuthToken } from "@config/cometchat";
import { env } from "@config/env";
import { AppError } from "@utils/AppError";
import { StatusCodes } from "http-status-codes";

const BASE_URL = `https://${env.COMETCHAT_APP_ID}.api-${env.COMETCHAT_REGION}.cometchat.io/v3`;
const adminHeaders = {
  "Content-Type": "application/json",
  apikey:         env.COMETCHAT_API_KEY,
  appid:          env.COMETCHAT_APP_ID,
};

// ── Auth token (friendship already confirmed by isFriends middleware) ─────────

export async function getChatAuthToken(cometChatUid: string): Promise<string> {
  return generateCometChatAuthToken(cometChatUid);
}

// ── Message history (proxy for headless access / server-side processing) ──────

export async function getMessageHistory(
  callerUid:   string,
  friendUid:   string,
  limit        = 25,
  before?:     string
): Promise<{ messages: unknown[]; hasMore: boolean }> {
  let url = `${BASE_URL}/messages?sender=${callerUid}&receiver=${friendUid}&limit=${limit}&receiverType=user`;
  if (before) url += `&id=${before}&searchAfter=false`;

  const res = await fetch(url, { headers: adminHeaders });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(`CometChat fetch messages failed: ${text}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const data = await res.json() as { data: unknown[]; meta?: { pagination?: { total: number } } };
  const messages = data.data ?? [];
  return {
    messages,
    hasMore: messages.length === limit,
  };
}

// ── Send message proxy ────────────────────────────────────────────────────────

export async function sendMessage(
  senderUid:   string,
  receiverUid: string,
  text:        string
): Promise<unknown> {
  const body = {
    category:     "message",
    type:         "text",
    data:         { text },
    receiver:     receiverUid,
    receiverType: "user",
  };

  const res = await fetch(`${BASE_URL}/messages`, {
    method:  "POST",
    headers: { ...adminHeaders, onBehalfOf: senderUid },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new AppError(`CometChat send message failed: ${t}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const data = await res.json() as { data: unknown };
  return data.data;
}
