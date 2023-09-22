import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    if (typeof user === 'object' && user !== null) {
      req.user = user as Record<string, any>;
      next();
    } else {
      res.status(400).json({ message: 'Invalid token.' });
    }
  });
};
