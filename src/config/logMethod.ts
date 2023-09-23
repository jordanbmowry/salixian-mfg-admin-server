import { Request } from 'express';

export function logMethod(req: Request, methodName: string, data?: any) {
  const { originalUrl, method, headers, body } = req;

  const headersToLog =
    process.env.NODE_ENV === 'development' ? headers : undefined;

  req.log.debug({
    __filename,
    methodName,
    originalUrl,
    method,
    headers: headersToLog,
  });

  if (data) {
    req.log.trace({ __filename, methodName, return: true, data });
  }
}
