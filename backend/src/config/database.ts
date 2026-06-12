import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "@utils/logger";

export async function connectDB(): Promise<void> {
  const uri = env.NODE_ENV === "test" ? env.MONGODB_URI_TEST : env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection failed", err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  logger.info("MongoDB disconnected");
}

mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected",  () => logger.info("MongoDB reconnected"));
mongoose.connection.on("error",        (err) => logger.error("MongoDB error", err));
