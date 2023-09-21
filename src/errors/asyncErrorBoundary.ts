import { Request, Response, NextFunction } from 'express';

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
    Promise.resolve()
      .then(() => delegate(request, response, next))
      .catch((error = {}) => {
        const { status = defaultStatus, message = error } = error as {
          status?: number;
          message?: any;
        };
        next({
          status,
          message,
        });
      });
  };
}

export default asyncErrorBoundary;
