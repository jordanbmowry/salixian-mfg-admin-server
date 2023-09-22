import express, {
  Express,
  Request,
  Response,
  Application,
  NextFunction,
} from 'express';
import usersRouter from './resources/users/users.router';
import cookieParser from 'cookie-parser';

import type { CustomError } from './types/types';

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.use('/users', usersRouter);

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use(
  (
    error: CustomError,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    console.error(error);
    const { status = 500, message = 'Something went wrong!' } = error;

    response.status(status).json({ error: message });
  }
);

export default app;
