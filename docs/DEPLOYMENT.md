# Deployment Guide — FriendChat

## Architecture overview

```
Browser
  │
  ▼
Vercel (Frontend — React/Vite)
  │  REST + WebSocket (HTTPS/WSS)
  ▼
Railway (Backend — Node.js/Express/Socket.IO)
  │  mongoose driver (TLS)
  ▼
MongoDB Atlas (Database — M0 Free)

All three tiers also connect to:
  CometChat (messaging platform — external SaaS)
```

---

## Prerequisites

Install the deployment CLIs once:

```bash
npm install -g @railway/cli vercel
railway login   # opens browser OAuth
vercel login    # opens browser OAuth
```

---

## Step 1 — MongoDB Atlas

### Create the cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign in
2. **Build a Database → M0 FREE** (no credit card needed)
3. Cloud provider: AWS
4. Region closest to your Railway deployment:
   - Railway US West → `AWS us-west-2`
   - Railway EU West → `AWS eu-west-1`
5. Cluster name: `friendchat-cluster`

### Create a database user

```
Security → Database Access → Add New Database User
  Authentication method: Password
  Username: friendchat
  Password: [generate a strong password with letters+numbers only]
  Database User Privileges: Atlas admin
```

> **Password tip:** Use only letters and numbers. Special characters must be URL-encoded in the connection string and this causes subtle bugs.

### Allow network access

```
Security → Network Access → Add IP Address → Allow Access from Anywhere
  CIDR: 0.0.0.0/0
  Comment: Railway backend (dynamic IPs)
```

Railway uses dynamic IP addresses — you cannot allowlist a fixed range.

### Get the connection string

```
Database → Connect → Drivers → Node.js
```

Copy the string, then edit it:

```
mongodb+srv://friendchat:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/friendchat
  ?retryWrites=true&w=majority&appName=Cluster0
```

Replace `<YOUR_PASSWORD>` and ensure the database name is `friendchat`.

---

## Step 2 — Railway (Backend)

### Create the project

```bash
cd friendchat-backend
railway init          # creates a new project, or link to existing
railway link          # if project already exists
```

### Set environment variables

Edit `scripts/set-railway-vars.sh` with your actual values, then run:

```bash
chmod +x scripts/set-railway-vars.sh
./scripts/set-railway-vars.sh
```

Or set manually one by one:

```bash
# Core
railway variables set NODE_ENV=production
railway variables set CLIENT_URL=https://your-app.vercel.app

# Database
railway variables set MONGODB_URI="mongodb+srv://..."

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
railway variables set JWT_SECRET=<64_char_hex>
railway variables set JWT_EXPIRES_IN=7d
railway variables set JWT_REFRESH_SECRET=<different_64_char_hex>
railway variables set JWT_REFRESH_EXPIRES_IN=30d

# CometChat
railway variables set COMETCHAT_APP_ID=<your_app_id>
railway variables set COMETCHAT_REGION=us
railway variables set COMETCHAT_API_KEY=<your_rest_api_key>
railway variables set COMETCHAT_AUTH_KEY=<your_auth_key>

# Rate limiting
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100

# Logging
railway variables set LOG_LEVEL=warn
```

> **Note:** Do NOT set `PORT` — Railway injects it automatically.

### Deploy

```bash
railway up
```

Railway detects Node.js, runs `npm ci && npm run build`, then `node dist/server.js`.

### Verify

```bash
railway logs --follow     # watch live logs
railway status            # check deployment status

# Test the health endpoint
curl https://your-app.railway.app/health
# Expected: {"status":"ok","ts":"2024-..."}
```

### Get your backend URL

```bash
railway domain
# or in the Railway dashboard under Settings → Networking
```

Note this URL — you'll need it for the frontend and for `CLIENT_URL`.

---

## Step 3 — Vercel (Frontend)

### Link the project

```bash
cd friendchat-frontend
vercel link   # follow prompts to create or link project
```

### Set environment variables in Vercel

```bash
# Set for Production environment
vercel env add VITE_API_BASE_URL production
# Enter: https://your-app.railway.app/api/v1

vercel env add VITE_COMETCHAT_APP_ID production
vercel env add VITE_COMETCHAT_REGION production
vercel env add VITE_COMETCHAT_AUTH_KEY production
```

Or in the Vercel dashboard: **Project → Settings → Environment Variables**

> **VITE_ prefix is required.** Vite strips all env vars without this prefix
> from the browser bundle. The `COMETCHAT_API_KEY` (REST admin key) must
> NEVER have the VITE_ prefix — it should only be in Railway.

### Deploy to production

```bash
vercel --prod
```

First deploy takes ~2 minutes. Subsequent deploys are faster due to caching.

### Verify

```bash
# Vercel shows the URL after deployment
# Test the app loads:
open https://your-app.vercel.app

# Test login works end-to-end:
# 1. Open the app
# 2. Register a new account
# 3. Check Railway logs for the registration request
# 4. Verify you can see the app dashboard
```

---

## Step 4 — Connect frontend to backend (CORS)

After deploying the frontend, update the backend's `CLIENT_URL`:

```bash
cd friendchat-backend
railway variables set CLIENT_URL=https://your-actual-app.vercel.app
railway up   # redeploy to apply the new variable
```

---

## Step 5 — Verify the full stack

Run through this checklist after both services are deployed:

```
✓ Health check:  GET https://backend.railway.app/health → 200
✓ Register:      POST /api/v1/auth/register → 201
✓ Login:         POST /api/v1/auth/login → 200 + cookie set
✓ Session:       GET /api/v1/auth/me → 200
✓ Users:         GET /api/v1/users → 200 with array
✓ CometChat:     GET /api/v1/chat/session-token → 200 with authToken
✓ Frontend:      App loads, login works, users page shows
✓ Real-time:     Open two browser tabs, send friend request → appears instantly
✓ Chat:          Accept friend request → send message → received in other tab
```

---

## Environment variable reference

### Railway (backend)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✓ | Must be `production` |
| `CLIENT_URL` | ✓ | Your Vercel frontend URL (for CORS) |
| `MONGODB_URI` | ✓ | Atlas connection string with database name |
| `JWT_SECRET` | ✓ | 64+ char random hex. Access token signing key |
| `JWT_EXPIRES_IN` | — | Default `7d` |
| `JWT_REFRESH_SECRET` | ✓ | 64+ char random hex. Must differ from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | — | Default `30d` |
| `COMETCHAT_APP_ID` | ✓ | From CometChat dashboard |
| `COMETCHAT_REGION` | ✓ | `us`, `eu`, or `in` |
| `COMETCHAT_API_KEY` | ✓ | REST API key — server side ONLY |
| `COMETCHAT_AUTH_KEY` | ✓ | Auth key — also used by frontend |
| `RATE_LIMIT_WINDOW_MS` | — | Default `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | — | Default `100` |
| `LOG_LEVEL` | — | `warn` in production |
| `PORT` | ✗ | Injected by Railway — never set manually |

### Vercel (frontend)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✓ | Your Railway backend URL + `/api/v1` |
| `VITE_COMETCHAT_APP_ID` | ✓ | From CometChat dashboard |
| `VITE_COMETCHAT_REGION` | ✓ | Match backend region |
| `VITE_COMETCHAT_AUTH_KEY` | ✓ | Auth key (safe for browser) |

---

## Production considerations

### Security

**JWT secrets must be cryptographically random and at least 64 characters.**

Generate them with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run this twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`. They must differ.

**`COMETCHAT_API_KEY` must never reach the browser.** It is a server-side-only admin key. The `COMETCHAT_AUTH_KEY` is safe in the browser — it can only authenticate users, not perform admin operations.

**MongoDB URI password:** Use only letters and numbers in the Atlas password. Special characters must be URL-percent-encoded, which causes subtle hard-to-debug errors.

### Performance

**Vercel** automatically serves from a global CDN. Vite's `manualChunks` config in `vite.config.ts` splits the CometChat SDK (~400KB) into a separate chunk so it's cached independently from your app code. Users only re-download the chunk that changed.

**Railway** runs a single Node.js process. For this app's scale (a portfolio assignment), this is sufficient. If you need horizontal scaling, Railway supports multiple replicas — but Socket.IO rooms would need Redis pub/sub to work across instances.

**MongoDB Atlas M0** has a 512MB storage limit and 100 connections. For a demo app this is plenty. Upgrade to M10 ($57/month) if you need more.

### Monitoring

```bash
# Live backend logs
railway logs --follow

# Check recent errors (filters log level)
railway logs | grep '"level":"error"'

# Vercel function logs (SSR edge functions — not used here but available)
vercel logs
```

For production monitoring, add [Sentry](https://sentry.io) to the backend:

```bash
npm install @sentry/node
# Add to src/server.ts before all other imports:
# import * as Sentry from "@sentry/node";
# Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Custom domains

**Vercel:**
```
Project → Settings → Domains → Add Domain
```
Vercel provides free TLS via Let's Encrypt automatically.

**Railway:**
```
Service → Settings → Networking → Custom Domain
```
Add a CNAME record in your DNS pointing to Railway's provided domain.

### CI/CD — GitHub integration

**Vercel** auto-deploys on every push to `main` when connected to GitHub:
```
Vercel Dashboard → Import Project → Connect GitHub repo
```
Preview deployments are created automatically for every pull request.

**Railway** auto-deploys on push to `main`:
```
Railway Dashboard → Service → Settings → Source → Connect GitHub repo
```

Both platforms deploy in ~2 minutes and roll back automatically if the health check fails.

---

## Rollback

**Vercel:**
```
Project → Deployments → Find previous deployment → ⋯ → Promote to Production
```

**Railway:**
```bash
railway rollback   # reverts to the previous successful deployment
```

---

## Quick command reference

```bash
# ── Railway ────────────────────────────────────────────────────────────────
railway login                              # authenticate
railway init                               # create new project
railway link                               # link existing project
railway variables                          # list all variables
railway variables set KEY=value            # set one variable
railway up                                 # deploy
railway logs --follow                      # live logs
railway status                             # deployment status
railway domain                             # get service URL
railway rollback                           # roll back one deploy

# ── Vercel ────────────────────────────────────────────────────────────────
vercel login                               # authenticate
vercel link                                # link project
vercel env add NAME environment            # add env var
vercel env ls                              # list env vars
vercel --prod                              # deploy to production
vercel logs                                # view logs
vercel rollback                            # roll back one deploy

# ── Secrets generation ────────────────────────────────────────────────────
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
