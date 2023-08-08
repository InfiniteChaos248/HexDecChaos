const winston = require("winston");

const logger = winston.createLogger(process.env.ENVIRONMENT === "prod" ? {
    level: "debug",
    format: winston.format.simple(),
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    transports: [new winston.transports.File({ filename: '../logs/node/app.log' })]
  } : {
    level: "silly",
    format: winston.format.simple(),
    colorize: true,
    transports: [new winston.transports.Console()]
  });

module.exports = logger;