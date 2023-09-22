import { Request } from 'express';

export function logMethod(req: Request, methodName: string, data?: any) {
  req.log.debug({ __filename, methodName });
  if (data) {
    req.log.trace({ __filename, methodName, return: true, data });
  }
}
