import { Router } from "express";
import authRoutes   from "./auth.routes";
import userRoutes   from "./user.routes";
import friendRoutes from "./friend.routes";
import chatRoutes   from "./chat.routes";

export const apiRouter = Router();

apiRouter.use("/auth",    authRoutes);
apiRouter.use("/users",   userRoutes);
apiRouter.use("/friends", friendRoutes);
apiRouter.use("/chat",    chatRoutes);
