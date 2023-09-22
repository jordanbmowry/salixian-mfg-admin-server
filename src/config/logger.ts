import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import pinoPretty from 'pino-pretty';

export function generateId(request: any): string {
  return request.headers['x-request-id'] || uuidv4();
}

const level = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';

const baseLoggerOptions = {
  level: level,
  name: 'myapp',
};

let logger: pino.Logger;

if (isDevelopment) {
  const prettyStream = pinoPretty({
    levelFirst: true,
    translateTime: 'SYS:standard',
    colorize: true,
  });

  logger = pino(baseLoggerOptions, prettyStream);
} else {
  logger = pino(baseLoggerOptions);
}

export default logger;
