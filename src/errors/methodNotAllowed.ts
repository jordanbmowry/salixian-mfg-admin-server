import { Request, Response, NextFunction } from 'express';

function methodNotAllowed(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  next({
    status: 405,
    message: `${req.method} not allowed for ${req.originalUrl}`,
  });
}

export default methodNotAllowed;
