import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';

function bodyHasDataProperty(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !('data' in req.body)) {
    const validationError = new AppError(
      400,
      'Request body must have a "data" property.'
    );
    return next(validationError);
  }
  next();
}

export default bodyHasDataProperty;
