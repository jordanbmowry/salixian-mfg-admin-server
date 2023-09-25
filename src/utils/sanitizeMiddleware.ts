import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Recursive function to sanitize all string properties in an object
function sanitize(obj: any): any {
  if (typeof obj === 'object' && obj !== null) {
    // If obj is an object, sanitize all of its properties
    for (const key in obj) {
      obj[key] = sanitize(obj[key]);
    }
  } else if (typeof obj === 'string') {
    // If obj is a string, sanitize the string
    return xss(obj);
  }
  return obj;
}

export function sanitizeRequestBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body = sanitize(req.body);
  next();
}
