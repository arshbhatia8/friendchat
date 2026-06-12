import mongoose from "mongoose";
import request  from "supertest";
import { app }  from "../../src/app";
import { connectDB, disconnectDB } from "../../src/config/database";

// Mock CometChat so tests don't need real credentials
jest.mock("../../src/config/cometchat", () => ({
  provisionCometChatUser:     jest.fn().mockResolvedValue(undefined),
  generateCometChatAuthToken: jest.fn().mockResolvedValue("mock_cc_token"),
  sendCometChatCustomMessage:  jest.fn().mockResolvedValue(undefined),
}));

// Mock Socket.IO (no real server in tests)
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

const validUser = {
  username: "testuser", email: "test@example.com",
  password: "password123", displayName: "Test User",
};

async function register(overrides = {}) {
  return request(app).post(`${BASE}/auth/register`).send({ ...validUser, ...overrides });
}

// ── Registration ──────────────────────────────────────────────────────────────

describe("POST /auth/register", () => {
  it("201 with user and accessToken on valid input", async () => {
    const res = await register();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("409 on duplicate email", async () => {
    await register();
    const res = await register();
    expect(res.status).toBe(409);
  });

  it("422 when required fields missing", async () => {
    const res = await request(app).post(`${BASE}/auth/register`).send({ email: "x@x.com" });
    expect(res.status).toBe(422);
  });

  it("422 when password too short", async () => {
    const res = await register({ password: "short" });
    expect(res.status).toBe(422);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  beforeEach(async () => { await register(); });

  it("200 with accessToken on valid credentials", async () => {
    const res = await request(app).post(`${BASE}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("401 on wrong password", async () => {
    const res = await request(app).post(`${BASE}/auth/login`)
      .send({ email: validUser.email, password: "wrongpass" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("401 on unknown email — same error as wrong password (no enumeration)", async () => {
    const res = await request(app).post(`${BASE}/auth/login`)
      .send({ email: "nobody@x.com", password: "whatever" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────

describe("GET /auth/me", () => {
  it("401 without token", async () => {
    const res = await request(app).get(`${BASE}/auth/me`);
    expect(res.status).toBe(401);
  });

  it("200 with valid token", async () => {
    const reg = await register();
    const token = reg.body.data.accessToken as string;
    const res = await request(app).get(`${BASE}/auth/me`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});
