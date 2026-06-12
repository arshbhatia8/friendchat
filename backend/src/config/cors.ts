import { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins: string[] =
  env.NODE_ENV === "production"
    ? [env.CLIENT_URL]
    : [env.CLIENT_URL, "http://localhost:3000", "http://localhost:5173"];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
};
