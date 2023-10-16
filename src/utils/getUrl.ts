import { Request, Response } from 'express';

export function getUrl(req: Request, _: Response) {
  return `${req.originalUrl}`;
}
