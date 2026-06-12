import { env } from "./env";
import { AppError } from "@utils/AppError";
import { StatusCodes } from "http-status-codes";

const BASE_URL = `https://${env.COMETCHAT_APP_ID}.api-${env.COMETCHAT_REGION}.cometchat.io/v3`;

const adminHeaders = {
  "Content-Type": "application/json",
  apikey:         env.COMETCHAT_API_KEY,
  appid:          env.COMETCHAT_APP_ID,
};

// ── User provisioning ────────────────────────────────────────────────────────

export async function provisionCometChatUser(
  uid: string,
  name: string,
  avatar?: string
): Promise<void> {
  const body: Record<string, string> = { uid, name };
  if (avatar) body.avatar = avatar;

  const res = await fetch(`${BASE_URL}/users`, {
    method:  "POST",
    headers: adminHeaders,
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(
      `CometChat provisioning failed: ${text}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// ── Auth token generation ────────────────────────────────────────────────────

export async function generateCometChatAuthToken(uid: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/users/${uid}/auth_tokens`, {
    method:  "POST",
    headers: adminHeaders,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(
      `CometChat auth token failed: ${text}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const data = await res.json() as { data: { authToken: string } };
  return data.data.authToken;
}

// ── Custom messages (friend request real-time delivery) ──────────────────────

export async function sendCometChatCustomMessage(
  senderUid:    string,
  receiverUid:  string,
  type:         string,
  customData:   Record<string, unknown>
): Promise<void> {
  const body = {
    category:     "custom",
    type,
    data:         { customData },
    receiver:     receiverUid,
    receiverType: "user",
  };

  const res = await fetch(`${BASE_URL}/messages`, {
    method:  "POST",
    headers: { ...adminHeaders, onBehalfOf: senderUid },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(
      `CometChat custom message failed: ${text}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
