import express, { Request, Response, NextFunction } from 'express';
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
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import { setTokenCookie } from '../../auth/setTokenCookie';

const VALID_PROPERTIES = [
  'user_name',
  'email',
  'role',
  'first_name',
  'last_name',
  'password',
];
const hasRequiredProperties = hasProperties('password', 'user_name');
const hasOnlyValidUserProps = hasOnlyValidProperties(...VALID_PROPERTIES);

function userExists(identifier: 'user_name' | 'user_id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.userId && identifier === 'user_id') {
      next({ status: 400, message: `Must enter a user_id as a param` });
      return;
    }

    if (!req.body.data?.user_name && identifier === 'user_name') {
      next({ status: 400, message: `Must enter a user_name` });
      return;
    }

    const whereObj =
      identifier === 'user_id'
        ? { user_id: req.params.userId }
        : { user_name: req.body.data?.user_name };

    const user = await read(whereObj);
    if (user) {
      res.locals.user = user;
      return next();
    }
    next({ status: 404, message: `User cannot be found.` });
  };
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function createUser(req: Request, res: Response): Promise<void> {
  const password = await hashPassword(req.body.data.password);
  const newUser: User = {
    ...req.body.data,
    password,
  };
  const data = await create(newUser);
  res.status(201).json({ data });
}

async function updateUser(req: Request, res: Response) {
  const updatedUser: User = {
    ...req.body.data,
    user_id: res.locals.user.user_id,
  };

  if (req.body.data?.hasOwnProperty('password')) {
    updatedUser.password = await hashPassword(req.body.data.password);
  }

  const data = await update(updatedUser);
  res.json({ data });
}

async function deleteUser(_: Request, res: Response) {
  const { user } = res.locals;
  await destroy(user.user_id);
  res.sendStatus(204);
}

async function listUsers(_: Request, res: Response) {
  const data = await list();
  res.json({ data });
}

function readUser(req: Request, res: Response) {
  res.json({ data: res.locals.user });
}

async function login(req: Request, res: Response) {
  const { password: passwordEntered } = req.body.data;
  const { user_id, password: hashedPassword, user_name } = res.locals.user;

  if (!passwordEntered) {
    res.status(401).send({ message: 'Password is required.' });
    return;
  }

  if (!user_name) {
    res.status(400).send({ message: 'Invalid username.' });
    return;
  }

  const passwordIsValid = await bcrypt.compare(passwordEntered, hashedPassword);
  if (!passwordIsValid) {
    res.status(400).send({ message: 'Invalid password.' });
    return;
  }

  if (!process.env.JWT_SECRET_KEY) {
    res.status(500).send({ message: 'Internal server error.' });
    return;
  }

  const token = jwt.sign(
    { username: user_name, id: user_id },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '30d',
    }
  );

  setTokenCookie(res, token);

  await updateLastLogin(user_id);

  const userData = { ...res.locals.user };
  delete userData.password;

  res.json({ data: userData });
}

function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Successfully logged out.' });
}

export default {
  create: [
    hasOnlyValidUserProps,
    hasRequiredProperties,
    asyncErrorBoundary(createUser),
  ],
  read: [asyncErrorBoundary(userExists('user_id')), readUser],
  update: [
    asyncErrorBoundary(userExists('user_id')),
    hasOnlyValidUserProps,
    asyncErrorBoundary(updateUser),
  ],
  delete: [
    asyncErrorBoundary(userExists('user_id')),
    asyncErrorBoundary(deleteUser),
  ],
  list: [asyncErrorBoundary(listUsers)],
  login: [
    asyncErrorBoundary(userExists('user_name')),
    asyncErrorBoundary(login),
  ],
  logout: [logout],
};
