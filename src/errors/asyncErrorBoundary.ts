import { Request, Response, NextFunction } from 'express';
import { logMethod } from '../config/logMethod';
import { AppError } from './AppError';

type Delegate = (
  request: Request,
  response: Response,
  next: NextFunction
) => void | Promise<void>;

function asyncErrorBoundary(
  delegate: Delegate,
  defaultStatus?: number
): (req: Request, res: Response, next: NextFunction) => void {
  return (request, response, next) => {
    logMethod(request, 'asyncErrorBoundary');
    Promise.resolve()
      .then(() => delegate(request, response, next))
      .catch((error = {}) => {
        const { status = defaultStatus ?? 500, message = error } = error as {
          status?: number;
          message?: any;
        };
        next(new AppError(status, message));
      });
  };
}

export default asyncErrorBoundary;
