import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

interface DecodedPayload {
  username: string;
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  const privateKey = Buffer.from(config.jwtSecretKey!, 'base64').toString(
    'utf8'
  );

  jwt.verify(token, privateKey, (err: VerifyErrors | null, decoded: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token has expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      return res.sendStatus(403);
    }

    if (decoded) {
      (req as any).user = decoded as DecodedPayload;
      next();
    } else {
      res.status(400).json({ message: 'Invalid token.' });
    }
  });
};
