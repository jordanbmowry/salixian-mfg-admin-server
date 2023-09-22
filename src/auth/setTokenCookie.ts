import express, { Response } from 'express';

export function setTokenCookie(res: Response, token: string) {
  const cookieOptions: express.CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  res.cookie('token', token, cookieOptions);
}
