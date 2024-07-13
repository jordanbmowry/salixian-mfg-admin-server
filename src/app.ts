// app.ts
import express, { Request, Response, Application, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import timeout from 'connect-timeout';

import config from './config/config';
import logger from './config/logger';
import { AppError } from './errors/AppError';
import { HttpStatusCode } from './errors/httpStatusCode';
import type { CustomError } from './types/types';

import usersRouter from './resources/users/users.router';
import customersRouter from './resources/customers/customers.router';
import ordersRouter from './resources/orders/orders.router';
import statsRouter from './resources/stats/stats.router';

const app: Application = express();

app.use(
  cors({
    origin: config.isDevelopment
      ? config.developmentClientBaseUrl
      : config.productionClientBaseUrl,
    credentials: true,
  })
);
app.use(helmet());
app.use(timeout('15s'));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(cookieParser());

// Middleware to handle timeout
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.timedout) next();
});

// Define routes
app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/orders', ordersRouter);
app.use('/stats', statsRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Not found: ${req.originalUrl}`));
});

// Error handling middleware
app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.error({
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
    });

    if (!error.status || (error.status >= 500 && error.status <= 599)) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error. Please try again later.',
      });
    }

    return res.status(error.status).json({ error: error.message });
  }
);

export default app;
