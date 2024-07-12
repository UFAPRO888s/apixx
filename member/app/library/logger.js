const path = require('path')
const winston = require('winston')
const { timestamp, label, combine, json, simple, printf } = winston.format;
const logDir = `${path.resolve('./')}/logs`;
const logger = winston.createLogger({
    format: combine(simple(), timestamp(), printf(info => `[${info.timestamp}] ${info.message}`)),
    transports: [
        new winston.transports.Console({ level: 'debug' }),
    ],
});
logger.stream = {
    write: (message, encoding) => {
        console.log(message)
        logger.info(message);
    },
};
module.exports = logger