import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyAccessToken } from "@utils/jwt";
import { User } from "@models/User.model";
import { logger } from "@utils/logger";

export async function socketAuthMiddleware(
  socket: Socket,
  next:   (err?: ExtendedError) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));

    const payload = verifyAccessToken(token);
    const user    = await User.findById(payload.userId).lean();

    if (!user || !user.isActive) {
      return next(new Error("User not found or inactive"));
    }

    socket.data.userId   = user._id.toString();
    socket.data.username = user.username;
    return next();
  } catch (err) {
    logger.warn("Socket auth failed", err);
    return next(new Error("Invalid or expired token"));
  }
}
