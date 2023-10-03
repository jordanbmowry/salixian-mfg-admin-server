import { Request, Response, NextFunction } from 'express';
import { logMethod } from '../config/logMethod';

function methodNotAllowed(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logMethod(req, 'methodNotAllowed');
  next({
    status: 405,
    message: `${req.method} not allowed for ${req.originalUrl}`,
  });
}

export default methodNotAllowed;
