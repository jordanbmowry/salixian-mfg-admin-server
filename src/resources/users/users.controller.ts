import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  create,
  read,
  update,
  destroy,
  User,
  WhereObj,
  list,
  updateLastLogin,
} from './users.service';
import hasProperties from '../../errors/hasProperties';
import hasOnlyValidProperties from '../../errors/hasOnlyValidProperties';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import { setTokenCookie } from '../../auth/setTokenCookie';
import { jwtSecretExists } from '../../auth/jwtSecretExists';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { ensureAdmin } from '../../auth/ensureAdmin';

const VALID_PROPERTIES = [
  'user_name',
  'email',
  'role',
  'first_name',
  'last_name',
  'password',
];
const NOT_FOUND = 404;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

interface RequestWithUser extends Request {
  user?: Record<string, any>;
}

const hasRequiredProperties = hasProperties('password', 'user_name');
const hasOnlyValidUserProps = hasOnlyValidProperties(...VALID_PROPERTIES);

async function userExists(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'userExists');
  const userId = req.params.userId;
  const userName = req.body.data?.user_name;

  if (userId) {
    await checkAndSetUser(req, { user_id: userId }, next, res);
  } else if (userName) {
    await checkAndSetUser(req, { user_name: userName }, next, res);
  } else {
    next(new AppError(BAD_REQUEST, 'Invalid user identifier provided.'));
  }
}

async function checkAndSetUser(
  req: RequestWithUser,
  whereObj: WhereObj,
  next: NextFunction,
  res: Response
): Promise<void> {
  logMethod(req, 'checkAndSetUser');
  const user = await read(whereObj);
  if (user) {
    res.locals.user = user;
    next();
  } else {
    next(new AppError(NOT_FOUND, 'User cannot be found.'));
  }
}

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function createUser(req: RequestWithUser, res: Response): Promise<void> {
  logMethod(req, 'createUser');
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
  const data = await list();
  res.json({ message: 'List users', data, status: 'success' });
}

function readUser(req: RequestWithUser, res: Response) {
  logMethod(req, 'readUser');
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
  const { user_id, password: hashedPassword, user_name } = res.locals.user;

  if (!passwordEntered || !user_name) {
    const message = !passwordEntered
      ? 'Password is required.'
      : 'Invalid username.';
    res.status(BAD_REQUEST).send({ message });
    return;
  }

  const passwordIsValid = await bcrypt.compare(passwordEntered, hashedPassword);
  if (!passwordIsValid) {
    res.status(BAD_REQUEST).send({ message: 'Invalid password.' });
    return;
  }

  if (!process.env.JWT_SECRET_KEY) {
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Internal server error.' });
    return;
  }

  const { role } = res.locals.user;
  const token = jwt.sign(
    { username: user_name, id: user_id, role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '30d',
    }
  );

  setTokenCookie(res, token);

  await updateLastLogin(user_id);

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

export default {
  create: [
    bodyHasDataProperty,
    hasOnlyValidUserProps,
    hasRequiredProperties,
    asyncErrorBoundary(createUser),
  ],
  read: [authenticateJWT, asyncErrorBoundary(userExists), readUser],
  update: [
    authenticateJWT,
    bodyHasDataProperty,
    hasOnlyValidUserProps,
    asyncErrorBoundary(userExists),
    asyncErrorBoundary(updateUser),
  ],
  delete: [
    authenticateJWT,
    ensureAdmin,
    asyncErrorBoundary(userExists),
    asyncErrorBoundary(deleteUser),
  ],
  list: [authenticateJWT, asyncErrorBoundary(listUsers)],
  login: [
    jwtSecretExists,
    bodyHasDataProperty,
    asyncErrorBoundary(userExists),
    asyncErrorBoundary(login),
  ],
  logout: [logout],
};
