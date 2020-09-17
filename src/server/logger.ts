import * as winston from 'winston';

export type Logger = winston.Logger;

const colorizer = winston.format.colorize();
winston.addColors({ timestamp: 'grey' });

export default function getLogger(label: string): Logger {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp({
        format: 'DD-MM-YY HH:mm:ss',
      }),
      winston.format.printf(
        ({ level, message, label, timestamp }) =>
          `[${colorizer.colorize(level, label)}] ${colorizer.colorize(
            'timestamp',
            timestamp
          )} ${message}`
      )
    ),
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      new winston.transports.Console({
        silent: process.env.NODE_ENV === 'test',
      }),
    ],
  });

  return logger;
}
