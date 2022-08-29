import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import { sendSlackMessage } from './slack';

const logDir = 'logs';
const { combine, printf } = winston.format;

const logFormat = printf(
  (info) => `${info.timestamp} ${info.level}: ${info.message}`,
);

const appendTimestamp = winston.format((info, opts) => {
  if (opts.tz) { info.timestamp = moment().tz(opts.tz).format('YYYY-MM-DD HH:mm:ss'); }
  return info;
});

const logger = winston.createLogger({
  format: combine(appendTimestamp({ tz: 'Asia/Seoul' }), logFormat),
  transports: [
    new WinstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: '%DATE%.log',
      maxFiles: 30,
      zippedArchive: true,
    }),
    new WinstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/error`,
      filename: '%DATE%.error.log',
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV !== 'prod') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
} else {
  logger.on('data', ({ level, message, timestamp: time }) => {
    if (!message.startsWith('[HttpException]')) {
      sendSlackMessage(`[${level}] ${message} (${time})`);
    }
  });
}

export default logger;
