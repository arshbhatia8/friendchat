import mongoose from "mongoose";
import request  from "supertest";
import { app }  from "../../src/app";
import { connectDB, disconnectDB } from "../../src/config/database";

jest.mock("../../src/config/cometchat", () => ({
  provisionCometChatUser:     jest.fn().mockResolvedValue(undefined),
  generateCometChatAuthToken: jest.fn().mockResolvedValue("mock_cc_token"),
  sendCometChatCustomMessage:  jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/sockets/index", () => ({
  getSocketServer:  () => ({ to: () => ({ emit: jest.fn() }) }),
  initSocketServer: jest.fn(),
}));

const BASE = "/api/v1";

beforeAll(async () => { await connectDB(); });
afterEach(async () => {
  const cols = mongoose.connection.collections;
  await Promise.all(Object.values(cols).map((c) => c.deleteMany({})));
});
afterAll(async () => { await disconnectDB(); });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createUser(n: number) {
  const res = await request(app).post(`${BASE}/auth/register`).send({
    username: `user${n}`, email: `user${n}@example.com`,
    password: "password123", displayName: `User ${n}`,
  });
  return { token: res.body.data.accessToken as string, id: res.body.data.user.id as string };
}

// ── Full lifecycle ────────────────────────────────────────────────────────────

describe("Friend request lifecycle", () => {
  it("send → accept → chat token granted (200)", async () => {
    const alice = await createUser(1);
    const bob   = await createUser(2);

    // Alice sends Bob a request
    const sendRes = await request(app)
      .post(`${BASE}/friends/request`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ receiverId: bob.id });
    expect(sendRes.status).toBe(201);
    const requestId = sendRes.body.data.request._id as string;

    // Bob sees it in incoming requests
    const listRes = await request(app)
      .get(`${BASE}/friends/requests`)
      .set("Authorization", `Bearer ${bob.token}`);
    expect(listRes.body.data.requests).toHaveLength(1);

    // Bob accepts
    const acceptRes = await request(app)
      .post(`${BASE}/friends/accept`)
      .set("Authorization", `Bearer ${bob.token}`)
      .send({ requestId });
    expect(acceptRes.status).toBe(200);

    // Alice can now get a chat token for Bob
    const tokenRes = await request(app)
      .get(`${BASE}/chat/token?with=${bob.id}`)
      .set("Authorization", `Bearer ${alice.token}`);
    expect(tokenRes.status).toBe(200);
    expect(tokenRes.body.data.authToken).toBe("mock_cc_token");
  });

  it("403 when non-friends attempt to get chat token (backend enforcement)", async () => {
    const alice = await createUser(1);
    const carol = await createUser(2);

    const res = await request(app)
      .get(`${BASE}/chat/token?with=${carol.id}`)
      .set("Authorization", `Bearer ${alice.token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("409 on duplicate friend request", async () => {
    const alice = await createUser(1);
    const bob   = await createUser(2);
    await request(app).post(`${BASE}/friends/request`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ receiverId: bob.id });
    const dup = await request(app).post(`${BASE}/friends/request`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ receiverId: bob.id });
    expect(dup.status).toBe(409);
  });

  it("reject → chat token still 403", async () => {
    const alice = await createUser(1);
    const bob   = await createUser(2);
    const sendRes = await request(app).post(`${BASE}/friends/request`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ receiverId: bob.id });
    const requestId = sendRes.body.data.request._id as string;

    await request(app).post(`${BASE}/friends/reject`)
      .set("Authorization", `Bearer ${bob.token}`)
      .send({ requestId });

    const tokenRes = await request(app)
      .get(`${BASE}/chat/token?with=${bob.id}`)
      .set("Authorization", `Bearer ${alice.token}`);
    expect(tokenRes.status).toBe(403);
  });

  it("400 when sending request to yourself", async () => {
    const alice = await createUser(1);
    const res   = await request(app).post(`${BASE}/friends/request`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ receiverId: alice.id });
    expect(res.status).toBe(400);
  });
});
