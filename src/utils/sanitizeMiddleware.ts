import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Recursive function to sanitize all string properties in an object or array
function sanitize(obj: any): any {
  // If obj is an array, sanitize each element in the array
  if (Array.isArray(obj)) {
    return obj.map((el) => sanitize(el));
  }
  // If obj is an object, sanitize all of its properties
  else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = sanitize(obj[key]);
    }
  }
  // If obj is a string, sanitize the string
  else if (typeof obj === 'string') {
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
