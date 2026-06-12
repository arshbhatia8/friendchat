import "express-async-errors";
import express, { Application } from "express";
import helmet       from "helmet";
import cors         from "cors";
import compression  from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan       from "morgan";

import { corsOptions }     from "@config/cors";
import { rateLimiter }     from "@middleware/rateLimiter";
import { errorHandler }    from "@middleware/errorHandler";
import { notFound }        from "@middleware/notFound";
import { requestLogger }   from "@middleware/requestLogger";
import { apiRouter }       from "@routes/index";

export const app: Application = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));          // pre-flight

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ── Sanitisation ─────────────────────────────────────────────────────────────
app.use(mongoSanitize());

// ── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP request logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use("/api", rateLimiter);

// ── Health check (outside rate limiter) ──────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/v1", apiRouter);

// ── Error handling (must be last) ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);
