import winston from "winston";

const { combine, timestamp, json } = winston.format;

const logLevel = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export const logger = winston.createLogger({
  levels: logLevel,
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: `log/combined.log`,
    }),
    new winston.transports.File({
      filename: `log/error.log`,
      level: `error`,
    }),
  ],
});
