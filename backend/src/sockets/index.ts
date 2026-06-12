import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "@types-local/socket.types";
import { corsOptions } from "@config/cors";
import { socketAuthMiddleware } from "./socket.middleware";
import { logger } from "@utils/logger";

type TypedIO = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: TypedIO;

export function initSocketServer(httpServer: HttpServer): TypedIO {
  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors:          corsOptions,
    pingTimeout:   60_000,
    pingInterval:  25_000,
  });

  // Authenticate every connection with the same JWT as HTTP routes
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const { userId, username } = socket.data;
    logger.info(`Socket connected: ${username} (${userId})`);

    // Each user joins a private room = their userId string.
    // Services emit to this room:  io.to(userId).emit("friend:accepted", payload)
    socket.join(userId);

    socket.on("ping", () => {
      logger.debug(`Ping from ${username}`);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${username} — ${reason}`);
    });

    socket.on("error", (err) => {
      logger.error(`Socket error for ${username}`, err);
    });
  });

  logger.info("Socket.IO server initialised");
  return io;
}

/**
 * Returns the singleton Socket.IO server.
 * Services call this to emit real-time events after DB writes.
 * Throws at startup time if called before initSocketServer() — fail fast.
 */
export function getSocketServer(): TypedIO {
  if (!io) throw new Error("Socket.IO server not yet initialised");
  return io;
}
