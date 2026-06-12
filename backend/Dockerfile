# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for the FriendChat backend
#
# Stage 1 (builder): installs ALL deps, compiles TypeScript to dist/
# Stage 2 (runner):  copies only dist/ and production node_modules
#                    Result: ~60% smaller final image, no dev tools exposed
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Security: don't run as root during build either
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dependencies first (layer cached until package.json changes)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Prune dev dependencies — only production deps go to the next stage
RUN npm prune --production

# ── Stage 2: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security hardening
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy only what the runtime needs
COPY --from=builder --chown=appuser:appgroup /app/dist        ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

# Create logs directory with correct ownership
RUN mkdir -p logs && chown appuser:appgroup logs

# Switch to non-root user
USER appuser

# Expose port (Railway reads PORT env var automatically)
EXPOSE 5000

# Health check — Railway uses this to confirm startup
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# dumb-init handles PID 1 signal forwarding for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
