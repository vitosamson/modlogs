import * as winston from 'winston';

winston.addColors({ timestamp: 'grey' });

const colorize = (...args: any[]) => winston.config.colorize.apply(winston, args);
const padZero = (val: number): string|number => {
  return val < 10 ? `0${val}` : val;
};
const formatLogs = (opts: { level: any; label: string; message: string; }): string => {
  const d = new Date();
  const colorizedLabel = colorize(opts.level, `[${opts.label}]`);
  const timestamp = colorize(
    'timestamp',
    `${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`
  );
  return `${colorizedLabel} ${timestamp} ${opts.message}`;
};

const createLogger = (label: string): winston.LoggerInstance => {
  winston.loggers.add(label, {
    console: {
      label,
      level: process.env.LOG_LEVEL || 'info',
      colorize: true,
      formatter: formatLogs,
      stderrLevels: ['error'],
    },
  });

  const logger = winston.loggers.get(label);

  if (process.env.NODE_ENV === 'test' && logger.transports.console) {
    logger.remove(winston.transports.Console);
  }

  return logger;
};

export default function getLogger(label: string): winston.LoggerInstance {
  if (winston.loggers.has(label)) return winston.loggers.get(label);
  return createLogger(label);
}
