# Pre-launch checklist

Work through this before considering the deployment done.

---

## Infrastructure

- [ ] MongoDB Atlas M0 cluster created in the correct region
- [ ] Atlas database user created with a strong alphanumeric password
- [ ] Atlas network access: `0.0.0.0/0` allowed
- [ ] Connection string tested — database name is `friendchat`
- [ ] Railway project created and CLI linked
- [ ] Vercel project created and CLI linked

---

## Environment variables

### Railway — verify every variable is set correctly

- [ ] `NODE_ENV=production`
- [ ] `CLIENT_URL` = your Vercel URL (https, no trailing slash)
- [ ] `MONGODB_URI` contains the real password (not `<password>`)
- [ ] `MONGODB_URI` ends with `/friendchat?retryWrites=true&w=majority`
- [ ] `JWT_SECRET` ≥ 64 characters
- [ ] `JWT_REFRESH_SECRET` ≥ 64 characters AND differs from `JWT_SECRET`
- [ ] `COMETCHAT_APP_ID` matches your CometChat app
- [ ] `COMETCHAT_API_KEY` is the REST API key (not the Auth Key)
- [ ] `COMETCHAT_AUTH_KEY` is the Auth Key
- [ ] `PORT` is NOT set (Railway injects it)

### Vercel — verify every variable is set correctly

- [ ] `VITE_API_BASE_URL` = Railway URL + `/api/v1` (https, no trailing slash)
- [ ] `VITE_COMETCHAT_APP_ID` matches Railway's `COMETCHAT_APP_ID`
- [ ] `VITE_COMETCHAT_REGION` matches Railway's `COMETCHAT_REGION`
- [ ] `VITE_COMETCHAT_AUTH_KEY` matches Railway's `COMETCHAT_AUTH_KEY`
- [ ] No `VITE_` variable contains the `COMETCHAT_API_KEY` (admin key)
- [ ] All variables set to "Production" environment (not just Preview)

---

## Deployment

- [ ] Backend deployed and health check returns 200
- [ ] Frontend deployed and loads in browser
- [ ] CORS: backend `CLIENT_URL` matches exact Vercel URL
- [ ] Both redeployed after `CLIENT_URL` was updated

---

## Functional tests

### Authentication

- [ ] Register a new account → redirects to `/app`
- [ ] Logout → redirects to `/login`
- [ ] Login with same credentials → redirects to `/app`
- [ ] Refresh page while logged in → stays logged in (session restored)
- [ ] Login with wrong password → error shown, no redirect

### Users page

- [ ] All registered users appear
- [ ] Search filters correctly
- [ ] "Add friend" button appears for users with no relationship
- [ ] "Pending" badge appears after sending a request

### Friend requests

- [ ] Open two browser windows as two different users
- [ ] Send friend request → appears in other window within 2 seconds (real-time ✓)
- [ ] Accept request → both users can now see "Friends" status
- [ ] Reject request → neither user can open a chat
- [ ] Accept request badge in sidebar increments immediately

### Conversations

- [ ] Accepted friends appear in conversation list
- [ ] Opening a conversation shows CometChat message UI
- [ ] Send a message → appears in other user's window in real time
- [ ] Typing indicator appears in other user's window
- [ ] Read receipt updates (✓✓) after other user opens the conversation
- [ ] Unread count in sidebar increments when a message arrives

### Security (manual)

- [ ] Open DevTools → Application → Cookies: `refreshToken` is `HttpOnly` ✓
- [ ] DevTools → Application → Local Storage: no token stored ✓
- [ ] Try `GET /api/v1/auth/me` without a token → 401
- [ ] Try `GET /api/v1/chat/token?with=<someId>` without being friends → 403
- [ ] Try `GET /api/v1/chat/token?with=<someId>` without auth → 401

---

## Performance

- [ ] Lighthouse score ≥ 80 on Performance (Vercel CDN serves gzipped assets)
- [ ] First Contentful Paint < 2 seconds
- [ ] No console errors in production (check DevTools)
- [ ] Bundle size: `npm run build` shows no chunks > 500KB

---

## Done

If every item is checked, the application is production-ready.
