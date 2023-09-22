import { Request, Response, NextFunction } from 'express';

const INTERNAL_SERVER_ERROR = 500;

export function jwtSecretExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!process.env.JWT_SECRET_KEY) {
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Internal server error.' });
    return;
  }
  next();
}
