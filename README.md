<div align="center">

<img src="https://placehold.co/80x80/4f46e5/ffffff?text=FC&font=Inter" alt="FriendChat" width="80" />

# FriendChat

**A social messaging app where you can only talk to your friends.**

Built as a take-home assignment for a Solution Engineer role at CometChat —
demonstrating end-to-end product design, backend enforcement of access rules,
and full integration of the CometChat platform.

<br />

[![Interactive Demo](https://img.shields.io/badge/%E2%96%B6%20Interactive%20Demo-Try%20it%20now-4f46e5?style=for-the-badge&logoColor=white)](https://arshbhatia8.github.io/friendchat/demo/index.html)

<br />

> 🎮 **No login required** — the demo runs entirely in the browser with no backend needed.
> Sign in with **alice@example.com** / **password123** to explore all features.
> Or open [`demo/index.html`](./demo/index.html) directly from the repo.

<br />

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![CometChat](https://img.shields.io/badge/CometChat-UI%20Kit-7c3aed)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Key Design Decisions](#key-design-decisions)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

FriendChat is a full-stack social messaging application with a hard constraint: **you can only send and receive messages with confirmed friends.** A user must send a friend request, and the other person must accept it, before either can open a conversation.

This restriction is enforced **at the backend level** — not just hidden buttons in the UI. Even a direct API call with a valid JWT is rejected if no confirmed friendship exists between the two users.

All messaging is powered by CometChat. The chat interface uses the CometChat React UI Kit and delivers real-time messages, typing indicators, online presence, and read receipts out of the box.

---

## Key Features

### Social Graph
- 🔍 **User discovery** — browse all registered users with live search and relationship-status badges
- 📨 **Friend requests** — send, receive, accept, and reject with optimistic UI updates
- ⚡ **Real-time delivery** — friend requests arrive instantly via CometChat's WebSocket (no polling)
- 👥 **Friends list** — manage confirmed friends with online/offline presence indicators

### Messaging
- 💬 **1-to-1 chat** — real-time messaging between confirmed friends via CometChat React UI Kit
- ✍️ **Typing indicators** — live "Alice is typing…" feedback
- ✅ **Read receipts** — double-tick status updates as messages are read
- 🟢 **Online presence** — green dot indicators updated in real time

### Access Control
- 🔒 **Backend-enforced friendship gate** — `isFriends()` middleware runs before every chat action
- 🔑 **Dual-token auth** — short-lived JWT in memory + long-lived refresh token in `httpOnly` cookie
- 🛡 **Rate limiting** — 100 requests per 15 minutes per IP

### UX
- 💀 **Skeleton loaders** — shimmer placeholders for every list type
- 🔔 **Toast notifications** — progress-bar toasts with four variants
- 📱 **Responsive design** — desktop sidebar + mobile bottom navigation
- ♿ **Accessible** — `aria-label`, `role="alert"`, focus rings, reduced-motion support

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser  —  React + Vite (Vercel)                      │
│  Zustand stores  ←→  Axios / CometChat SDK              │
│  CometChat React UI Kit                                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / WSS
       ┌───────────────▼────────────────────┐
       │  Express + Socket.IO  (Railway)     │
       │                                    │
       │  verifyToken → isFriends           │  ← friendship gate
       │  Controllers → Services            │
       │  Mongoose    → MongoDB Atlas       │
       │                                    │
       │  CometChat Admin API (server only) │  ← token issuance
       └────────────────────────────────────┘
                       │
       ┌───────────────▼────────────────────┐
       │  CometChat Platform                │
       │  (WebSocket + message storage)     │
       └────────────────────────────────────┘
```

### How CometChat integrates

| Surface | Where | Used for |
|---|---|---|
| Admin REST API | Backend only | Provisioning users, generating auth tokens, delivering friend-request notifications |
| JavaScript SDK / UI Kit | Frontend only | Real-time messaging, presence, typing, receipts |

The Admin API key (`COMETCHAT_API_KEY`) **never reaches the browser.**

### The friendship gate

```
GET /api/v1/chat/token?with=<userId>

  verifyToken  →  validate JWT, attach req.user
  isFriends    →  query Friendship collection
                  throw 403 if no document found
  getChatToken →  call CometChat Admin API
                  return authToken to client
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20 + TypeScript | Runtime + type safety |
| Express.js | HTTP server and routing |
| MongoDB + Mongoose | Database and ODM |
| Socket.IO | Real-time accept/reject notifications |
| JWT | Stateless authentication |
| Joi | Request body validation |
| Winston | Structured logging |
| bcryptjs | Password hashing (cost 12) |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI library |
| Vite | Build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Zustand | State management |
| Axios | HTTP client with auto token refresh |
| CometChat JS SDK | Real-time messaging, presence, typing |
| CometChat React UI Kit | Pre-built chat UI |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Managed database (M0 free tier) |
| Railway | Backend hosting |
| Vercel | Frontend hosting (global CDN) |

---

## Local Development

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or 20 LTS |
| MongoDB | Local or Atlas free tier |
| CometChat account | Free tier — [cometchat.com](https://www.cometchat.com) |

### Clone

```bash
git clone https://github.com/arshbhatia8/friendchat.git
cd friendchat
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables below)

npm run seed      # creates alice, bob, carol, dave / password: password123
npm run dev       # starts at http://localhost:5000

# verify
curl http://localhost:5000/health
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values

npm run dev       # starts at http://localhost:5173
```

Open two browser windows and log in as different users to test real-time features.

**Test accounts (after seeding)**

| Email | Password | Status |
|---|---|---|
| alice@example.com | password123 | Friends with Bob |
| bob@example.com | password123 | Friends with Alice |
| carol@example.com | password123 | Pending request to Alice |
| dave@example.com | password123 | No relationships |

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | — | `development` or `production` |
| `PORT` | — | HTTP port (default 5000) |
| `CLIENT_URL` | ✓ | Frontend URL for CORS |
| `MONGODB_URI` | ✓ | MongoDB connection string |
| `JWT_SECRET` | ✓ | Access token signing key — min 64 chars |
| `JWT_EXPIRES_IN` | — | Default `7d` |
| `JWT_REFRESH_SECRET` | ✓ | Refresh token key — must differ from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | — | Default `30d` |
| `COMETCHAT_APP_ID` | ✓ | CometChat app ID |
| `COMETCHAT_REGION` | ✓ | `us`, `eu`, or `in` |
| `COMETCHAT_API_KEY` | ✓ | REST Admin key — **server-side only, never expose to browser** |
| `COMETCHAT_AUTH_KEY` | ✓ | Auth key (also used by frontend) |
| `RATE_LIMIT_WINDOW_MS` | — | Default `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | — | Default `100` |
| `LOG_LEVEL` | — | `error`, `warn`, `info`, `debug` |

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run twice — use different values for each secret
```

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✓ | Backend URL + `/api/v1` |
| `VITE_COMETCHAT_APP_ID` | ✓ | CometChat app ID |
| `VITE_COMETCHAT_REGION` | ✓ | Must match backend |
| `VITE_COMETCHAT_AUTH_KEY` | ✓ | Safe to expose in browser |

> `VITE_` prefix is required — Vite strips all other env vars from the browser bundle.

---

## API Reference

All routes are prefixed `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

**Response envelope**
```json
{ "success": true,  "message": "...", "data": {} }
{ "success": false, "error": "...",   "details": [] }
```

### Authentication

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register, provision CometChat user |
| `POST` | `/auth/login` | — | Login, receive access token |
| `GET`  | `/auth/me` | JWT | Get current user profile |
| `POST` | `/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/auth/logout` | — | Clear session cookie |

### Friend Requests

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/friends/request` | JWT | Send a friend request |
| `GET`  | `/friends/requests` | JWT | List incoming pending requests |
| `POST` | `/friends/accept` | JWT | Accept a request |
| `POST` | `/friends/reject` | JWT | Reject a request |

### Friendships

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET`    | `/friends` | JWT | List confirmed friends |
| `GET`    | `/users` | JWT | Discover users with relationship status |
| `DELETE` | `/friends/:friendId` | JWT | Remove a friend |

### Conversations

| Method | Route | Auth | Middleware | Description |
|---|---|---|---|---|
| `GET` | `/chat/token` | JWT | `isFriends` | Get CometChat auth token |
| `GET` | `/chat/conversations` | JWT | — | List allowed conversations |
| `GET` | `/chat/messages/:friendId` | JWT | `isFriends` | Fetch message history |
| `POST` | `/chat/messages/:friendId` | JWT | `isFriends` | Send message (proxy) |

### Socket.IO Events

```javascript
// Connect
const socket = io("http://localhost:5000", { auth: { token: accessToken } });

// Events received
socket.on("friend:accepted", ({ friendId, friendName }) => { ... });
socket.on("friend:rejected", ({ requestId, rejectedBy }) => { ... });
```

> Friend *requests* are delivered via CometChat custom messages (type `FRIEND_REQUEST`), not Socket.IO.

---

## Key Design Decisions

### 1. Backend enforcement via `isFriends` middleware

Making this route-level middleware means it is impossible to add a new chat endpoint without explicitly declaring the friendship check. Access control is structural — it cannot be accidentally skipped by a future developer.

### 2. Separate `Friendship` collection

A common shortcut is `status = "ACCEPTED"` on `FriendRequest`. This was rejected because the friendship check runs on every chat action — it needs to hit a table containing **only confirmed friendships**, with no filter and the smallest possible scan.

### 3. Canonical ordering

The two user IDs in `Friendship` are always stored sorted. `areFriends(A, B)` and `areFriends(B, A)` always hit the same compound index entry — one query, always.

```typescript
const [a, b] = [userIdA, userIdB].sort();
Friendship.findOne({ userAId: a, userBId: b });
```

### 4. CometChat custom messages for friend request delivery

The recipient's CometChat WebSocket is already open for chat. Reusing it for friend-request notifications means zero additional infrastructure — no separate notification service needed.

### 5. Access token in memory, not localStorage

`localStorage` is readable by any JavaScript on the page. The access token lives in a module-scoped variable. On page reload, `ProtectedRoute` calls `POST /auth/refresh` (which reads the `httpOnly` cookie) and reissues the token in ~100ms.

---

## Project Structure

```
friendchat/
├── backend/
│   ├── src/
│   │   ├── config/          env, database, cors, cometchat Admin API
│   │   ├── models/          User, FriendRequest, Friendship
│   │   ├── middleware/       verifyToken, isFriends, validate, errorHandler
│   │   ├── controllers/     auth, user, friend, chat
│   │   ├── services/        auth, user, friend, chat
│   │   ├── routes/          auth, user, friend, chat
│   │   ├── sockets/         Socket.IO server + JWT middleware
│   │   ├── utils/           AppError, jwt, logger, apiResponse, friendship
│   │   └── validators/      auth, friend
│   ├── tests/integration/   auth.test.ts, friends.test.ts
│   └── scripts/seed.ts
│
└── frontend/
    └── src/
        ├── router/          index, ProtectedRoute, PublicRoute
        ├── layouts/         AuthLayout, AppLayout
        ├── pages/           Login, Register, Users, Requests, Conversations
        ├── components/
        │   ├── ui/          Button, Input, Avatar, Skeleton, Toast, ErrorAlert…
        │   ├── auth/        LoginForm, RegisterForm
        │   ├── users/       UserCard
        │   ├── requests/    FriendRequestCard
        │   ├── chat/        ChatContainer, ConversationList, UIKitProvider
        │   └── layout/      Sidebar
        ├── store/           auth, users, requests, friends, conversations, cometchat
        ├── services/        api.client, auth, users, friends, chat
        └── hooks/           useCometChat, useFriendRequestListener
```

---

## Deployment

| Service | Platform |
|---|---|
| Database | MongoDB Atlas (M0 free) |
| Backend | Railway |
| Frontend | Vercel |

```bash
# Backend
cd backend && railway login && railway init && railway up

# Frontend
cd frontend && vercel --prod

# Update CORS after frontend deploy
railway variables set CLIENT_URL=https://your-app.vercel.app && railway up
```

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the complete step-by-step guide.

---

## Running Tests

```bash
cd backend

npm test                    # all tests
npm run test:integration    # integration only
npm test -- --coverage      # with coverage report
```

Tests use `mongodb-memory-server` — no running MongoDB needed. All CometChat calls are mocked.

---

<div align="center">

Built by **[Arsh Bhatia](https://github.com/arshbhatia8)** · [LinkedIn](https://www.linkedin.com/in/arsh-bhatia-/)

Powered by [CometChat](https://www.cometchat.com) · Hosted on [Railway](https://railway.app) and [Vercel](https://vercel.com)

</div>
