import "dotenv/config";
import http from "http";
import { app }              from "./app";
import { connectDB }        from "@config/database";
import { initSocketServer } from "@sockets/index";
import { env }              from "@config/env";
import { logger }           from "@utils/logger";

process.title = "friendchat-backend";

// Trust Railway's reverse proxy so req.ip = real client IP (rate limiting works correctly)
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

async function bootstrap(): Promise<void> {
  await connectDB();
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  await new Promise<void>((resolve) => httpServer.listen(env.PORT, resolve));
  logger.info(`Server started on port ${env.PORT}`, { env: env.NODE_ENV });

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received — graceful shutdown`);
    httpServer.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    // Railway gives 10s before SIGKILL
    setTimeout(() => { logger.error("Forced shutdown"); process.exit(1); }, 9000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("unhandledRejection", (r) => logger.error("Unhandled rejection", { reason: String(r) }));
  process.on("uncaughtException",  (e) => { logger.error("Uncaught exception", e); process.exit(1); });
}

bootstrap().catch((err) => { console.error("Fatal:", err); process.exit(1); });
