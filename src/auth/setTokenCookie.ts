import express, { Response } from 'express';

export function setTokenCookie(res: Response, token: string) {
  let cookieOptions: express.CookieOptions;

  if (process.env.NODE_ENV === 'production') {
    // Production settings
    cookieOptions = {
      httpOnly: true,
      secure: true, // ensure cookies are sent over HTTPS
      sameSite: 'none', // allow browser to send cookie with cross-origin requests
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  } else {
    // Development settings
    cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax', // or 'strict'
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  res.cookie('token', token, cookieOptions);
}
