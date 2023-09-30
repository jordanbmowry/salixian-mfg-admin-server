import express, { Request, Response, Application, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import usersRouter from './resources/users/users.router';
import customersRouter from './resources/customers/customers.router';
import ordersRouter from './resources/orders/orders.router';
import statsRouter from './resources/stats/stats.router';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import logger from './config/logger';
import { AppError } from './errors/AppError';
import { HttpStatusCode } from './errors/httpStatusCode';
import type { CustomError } from './types/types';

const {
  NODE_ENV = 'development',
  DEVELOPMENT_CLIENT_BASE_URL,
  PRODUCTION_CLIENT_BASE_URL,
} = process.env;

const CLIENT_URL_BASE_URL =
  NODE_ENV === 'development'
    ? DEVELOPMENT_CLIENT_BASE_URL
    : PRODUCTION_CLIENT_BASE_URL;

const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
});

app.use(
  cors({
    origin: CLIENT_URL_BASE_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(cookieParser());
app.use(limiter);

app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/orders', ordersRouter);
app.use('/stats', statsRouter);

app.use((req, res, next) => {
  next(new AppError(404, `Not found: ${req.originalUrl}`));
});

app.use(
  (
    error: CustomError,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    logger.error(error);
    if (!error.status || (error.status >= 500 && error.status <= 599)) {
      return response
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error. Please try again later.' });
    }

    return response.status(error.status).json({ error: error.message });
  }
);

export default app;
