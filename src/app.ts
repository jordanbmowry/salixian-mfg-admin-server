import express, { Request, Response, Application, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import usersRouter from './resources/users/users.router';
import customersRouter from './resources/customers/customers.router';
import ordersRouter from './resources/orders/orders.router';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import logger from './config/logger';
import { AppError } from './errors/AppError';
import type { CustomError } from './types/types';

const app: Application = express();

// application middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(cookieParser());

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
