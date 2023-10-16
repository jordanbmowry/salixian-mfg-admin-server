import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  create,
  read,
  update,
  destroy,
  WhereObj,
  list,
  updateLastLogin,
} from './users.service';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import {
  sanitizeRequestBody,
  sanitizeParams,
} from '../../utils/sanitizeMiddleware';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import { setTokenCookie } from '../../auth/setTokenCookie';
import { jwtSecretExists } from '../../auth/jwtSecretExists';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { ensureAdmin } from '../../auth/ensureAdmin';
import type { User } from '../../types/types';
import {
  userSchema,
  userUpdateSchema,
} from '../../errors/joiValidationSchemas';
import path from 'path';
import { Worker } from 'worker_threads';
import argon2 from 'argon2';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { checkDuplicate } from '../../errors/checkDuplicates';
import { generateCacheKey } from '../../utils/genterateCacheKey';

const { NODE_ENV = 'development', RAILWAY_PROJECT_ROOT } = process.env;

const BASE_PATH =
  NODE_ENV === 'production'
    ? RAILWAY_PROJECT_ROOT || ''
    : process.env.BASE_PATH || '';

const relativePath = path.join(BASE_PATH, 'dist/auth/hashWorker.js');

const absolutePath = path.resolve(relativePath);

const worker = new Worker(absolutePath);

interface RequestWithUser extends Request {
  user?: Record<string, any>;
}

function ensureAuthorizedToUpdate(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void {
  logMethod(req, 'ensureAuthorizedToUpdate');

  if (req.user?.role === 'admin') {
    return next();
  }

  if (req.user?.id === res.locals.user.user_id) {
    return next();
  }

  next(
    new AppError(
      HttpStatusCode.UNAUTHORIZED,
      'Not authorized to update this user.'
    )
  );
}

async function userExists(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'userExists');
  const userId = req.params.userId ?? req.user?.id;
  const email = req.body.data?.email;

  let whereObj: WhereObj | undefined;

  if (userId) {
    whereObj = { user_id: userId };
  } else if (email) {
    whereObj = { email };
  }

  if (whereObj) {
    await checkAndSetUser(req, whereObj, next, res);
  } else {
    next(
      new AppError(
        HttpStatusCode.BAD_REQUEST,
        'Invalid user identifier provided.'
      )
    );
  }
}

async function checkAndSetUser(
  req: RequestWithUser,
  whereObj: WhereObj,
  next: NextFunction,
  res: Response
): Promise<void> {
  logMethod(req, 'checkAndSetUser');
  const user = await read(
    generateCacheKey(req, res, 'check-and-set-user'),
    whereObj
  );
  if (user) {
    res.locals.user = user;
    next();
  } else {
    let userIndentification;

    if ('user_id' in whereObj) {
      userIndentification = whereObj.user_id;
    } else {
      userIndentification = whereObj.email;
    }

    next(
      new AppError(
        HttpStatusCode.NOT_FOUND,
        `User ${userIndentification} cannot be found.`
      )
    );
  }
}

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    worker.on('message', (message) => {
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message.hash);
      }
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
    worker.postMessage(password);
  });
}

async function createUser(req: RequestWithUser, res: Response): Promise<void> {
  logMethod(req, 'createUser');

  const validation = userSchema.validate(req.body.data);
  if (validation.error) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, validation.error.message);
  }

  const password = await hashPassword(req.body.data.password);
  const newUser: User = {
    ...req.body.data,
    password,
  };
  const data = await create(newUser);
  res.status(201).json({ data });
}

interface UserForUpdate extends User {
  user_id: string;
}

async function updateUser(req: RequestWithUser, res: Response): Promise<void> {
  logMethod(req, 'updateUser');

  const validation = userUpdateSchema.validate(req.body.data);
  if (validation.error) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, validation.error.message);
  }

  if (req.user?.role !== 'admin' && Object.hasOwn(req.body.data, 'role')) {
    throw new AppError(
      HttpStatusCode.FORBIDDEN,
      "You're not allowed to update the user role."
    );
  }

  const updatedUser: UserForUpdate = {
    ...req.body.data,
    user_id: res.locals.user.user_id,
  };

  if (Object.hasOwn(req.body.data, 'password')) {
    updatedUser.password = await hashPassword(req.body.data.password);
  }

  const data = await update(updatedUser);
  res.json({ status: 'success', data, message: 'Updated user' });
}

async function deleteUser(req: RequestWithUser, res: Response): Promise<void> {
  logMethod(req, 'deleteUser');
  const { user } = res.locals;
  await destroy(user.user_id);
  res.sendStatus(204);
}

async function listUsers(req: RequestWithUser, res: Response): Promise<void> {
  logMethod(req, 'listUsers');
  const data = await list(generateCacheKey(req, res, 'list-users'));
  res.json({ message: 'List users', data, status: 'success' });
}

function readUser(req: RequestWithUser, res: Response) {
  logMethod(req, 'readUser');

  if (res.locals.user) {
    const { password, ...userWithoutPassword } = res.locals.user;
    res.locals.user = userWithoutPassword;
  }

  res.json({
    status: 'success',
    data: res.locals.user,
    message: 'Read user',
  });
}

async function login(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'login');
  const { password: passwordEntered } = req.body.data;
  const { user_id, password: hashedPassword, email } = res.locals.user;

  if (!passwordEntered || !email) {
    const message = !passwordEntered
      ? 'Password is required.'
      : 'Invalid username.';
    next(new AppError(HttpStatusCode.BAD_REQUEST, message));
    return;
  }

  const passwordIsValid = await argon2.verify(hashedPassword, passwordEntered);
  await updateLastLogin(user_id);

  if (!passwordIsValid) {
    next(new AppError(HttpStatusCode.BAD_REQUEST, 'Invalid password.'));
    return;
  }

  const { role } = res.locals.user;
  const privateKey = Buffer.from(
    process.env.JWT_SECRET_KEY!,
    'base64'
  ).toString('utf8');
  const token = jwt.sign({ username: email, id: user_id, role }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '30d',
  });

  setTokenCookie(res, token);

  const userData = { ...res.locals.user };
  delete userData.password;

  res.json({
    status: 'success',
    data: userData,
    message: 'Login successful',
  });
}

function logout(req: RequestWithUser, res: Response) {
  logMethod(req, 'logout');
  res.clearCookie('token');
  res.json({ status: 'success', message: 'Successfully logged out.' });
}

function checkAuthStatus(req: RequestWithUser, res: Response) {
  logMethod(req, 'checkAuthStatus');
  delete res.locals.user.password;
  res.json({
    status: 'success',
    data: {
      ...res.locals.user,
      isAuthenticated: true,
    },
    message: 'Authenticated.',
  });
}

export default {
  create: [
    authenticateJWT,
    ensureAdmin,
    sanitizeRequestBody,
    bodyHasDataProperty,
    checkDuplicate({
      table: 'users',
      fields: ['email'],
      primaryKey: 'user_id',
      paramKey: 'userId',
    }),
    asyncErrorBoundary(createUser),
  ],
  read: [
    authenticateJWT,
    sanitizeParams,
    asyncErrorBoundary(userExists),
    readUser,
  ],
  update: [
    authenticateJWT,
    sanitizeRequestBody,
    sanitizeParams,
    bodyHasDataProperty,
    asyncErrorBoundary(userExists),
    checkDuplicate({
      table: 'users',
      fields: ['email'],
      primaryKey: 'user_id',
      paramKey: 'userId',
    }),
    ensureAuthorizedToUpdate,
    asyncErrorBoundary(updateUser),
  ],
  delete: [
    authenticateJWT,
    ensureAdmin,
    sanitizeParams,
    asyncErrorBoundary(userExists),
    asyncErrorBoundary(deleteUser),
  ],
  list: [authenticateJWT, ensureAdmin, asyncErrorBoundary(listUsers)],
  login: [
    jwtSecretExists,
    sanitizeRequestBody,
    bodyHasDataProperty,
    asyncErrorBoundary(userExists),
    asyncErrorBoundary(login),
  ],
  logout: [logout],
  checkAuthStatus: [
    authenticateJWT,
    asyncErrorBoundary(userExists),
    checkAuthStatus,
  ],
};
