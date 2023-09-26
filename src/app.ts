import express, { Request, Response, Application, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import usersRouter from './resources/users/users.router';
import customersRouter from './resources/customers/customers.router';
import ordersRouter from './resources/orders/orders.router';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import logger from './config/logger';
import { AppError } from './errors/AppError';
import type { CustomError } from './types/types';

const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later',
});
// application middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(cookieParser());
app.use(limiter);

// routes
app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/orders', ordersRouter);

// Not found handler
app.use((request, response, next) => {
  next(new AppError(404, `Not found: ${request.originalUrl}`));
});

// Error handler
app.use(
  (
    error: CustomError,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    logger.error(error);
    const { status = 500, message = 'Something went wrong!' } = error;

    response.status(status).json({ error: message });
  }
);

export default app;
