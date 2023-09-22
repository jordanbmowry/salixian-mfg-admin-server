import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { create, read, update, User } from './users.service';
import hasProperties from '../../errors/hasProperties';
import hasOnlyValidProperties from '../../errors/hasOnlyValidProperties';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';

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

async function userExists(req: Request, res: Response, next: NextFunction) {
  const user = await read(req.params.userId);
  if (user) {
    res.locals.user = user;
    return next();
  }
  next({ status: 404, message: `User cannot be found.` });
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

export default {
  create: [
    hasOnlyValidUserProps,
    hasRequiredProperties,
    asyncErrorBoundary(createUser),
  ],
  read: [
    asyncErrorBoundary(userExists),
    (req: Request, res: Response) => res.json({ data: res.locals.user }),
  ],
  update: [
    asyncErrorBoundary(userExists),
    hasOnlyValidUserProps,
    asyncErrorBoundary(updateUser),
  ],
};
