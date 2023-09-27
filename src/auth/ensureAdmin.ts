import { Request, Response, NextFunction } from 'express';
import { UserRole } from './UserRole';

interface RequestWithUser extends Request {
  user?: Record<string, any>;
}

export function ensureAdmin(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(403).send({ message: 'Access denied: Admin only' });
  }
}
