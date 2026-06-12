import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "@config/env";

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${message}${extras}`;
  })
);

const prodFormat = combine(timestamp(), json());

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: env.NODE_ENV === "production" ? prodFormat : devFormat,
    silent: env.NODE_ENV === "test",
  }),
];

if (env.NODE_ENV !== "test") {
  transports.push(
    new DailyRotateFile({
      filename:      "logs/error-%DATE%.log",
      datePattern:   "YYYY-MM-DD",
      level:         "error",
      maxFiles:      "14d",
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename:      "logs/combined-%DATE%.log",
      datePattern:   "YYYY-MM-DD",
      maxFiles:      "7d",
      zippedArchive: true,
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
});
