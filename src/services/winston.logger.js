import winston from "winston";
import config from "../config.js";

const customErrorLevels = {
  levels: { fatal: 0, error: 1, warning: 2, info: 3, http: 4, debug: 5 },
  colors: {
    fatal: "red",
    error: "red",
    warning: "yellow",
    info: "green",
    http: "blue",
    debug: "white",
  },
};

const devLogger = winston.createLogger({
  levels: customErrorLevels.levels,
  format: winston.format.combine(
    winston.format.colorize({ colors: customErrorLevels.colors }),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console({ level: "debug" })],
});

const prodLogger = winston.createLogger({
  levels: customErrorLevels.levels,
  transports: [
    new winston.transports.File({
      level: "info",
      filename: `${config.__DIRNAME}/logs/errors.log`,
    }),
  ],
});

const addLogger = (req, res, next) => {
  req.logger = config.MODE === "dev" ? devLogger : prodLogger;
  req.logger.http(`${new Date().toDateString()} ${req.method} ${req.url}`);
  next();
};

export default addLogger;
