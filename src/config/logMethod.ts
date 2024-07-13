import { Request } from 'express';
import logger from './logger';
import config from './config';

interface LogDetails {
  file: string;
  method: string;
  url: string;
  httpMethod: string;
  headers?: any;
  body?: any;
  returnData?: any;
}

export function logMethod(req: Request, methodName: string, data?: any): void {
  const { originalUrl, method, headers, body } = req;

  const logDetails: LogDetails = {
    file: __filename,
    method: methodName,
    url: originalUrl,
    httpMethod: method,
    headers: config.isDevelopment ? headers : undefined,
    body: config.isDevelopment ? body : undefined,
    returnData: data,
  };

  logger.debug(logDetails);

  if (data) {
    logger.trace({ ...logDetails, returnData: data });
  }
}
