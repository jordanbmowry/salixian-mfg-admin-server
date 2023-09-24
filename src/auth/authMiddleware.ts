import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

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

  const privateKey = Buffer.from(
    process.env.JWT_SECRET_KEY!,
    'base64'
  ).toString('utf8');

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
      (req as any).user = decoded as Record<string, any>;
      next();
    } else {
      res.status(400).json({ message: 'Invalid token.' });
    }
  });
};
