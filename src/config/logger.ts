import pino from 'pino';
import pinoPretty from 'pino-pretty';
import config from './config';

const baseLoggerOptions: pino.LoggerOptions = {
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  name: 'salixian-mfg-admin-server',
};

const logger = config.isDevelopment
  ? pino(
      baseLoggerOptions,
      pinoPretty({
        levelFirst: true,
        translateTime: 'SYS:standard',
        colorize: true,
      })
    )
  : pino(baseLoggerOptions);

export default logger;
