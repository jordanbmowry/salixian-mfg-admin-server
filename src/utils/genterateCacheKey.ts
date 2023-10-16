import { Request, Response } from 'express';

// utils/generateCacheKey.ts
export function generateCacheKey(
  req: Request,
  res: Response,
  description: string
): string {
  const basePath = req.baseUrl + req.path;
  const queryString = Object.entries(req.query)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${req.method}:${basePath}?${queryString}:${description}`;
}
