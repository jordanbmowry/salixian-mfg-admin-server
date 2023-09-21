// /src/resources/users/users.controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { create, User } from './users.service';
import hasProperties from '../../errors/hasProperties';
import hasOnlyValidProperties from '../../errors/hasOnlyValidProperties';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';

const hasRequiredProperties = hasProperties('password', 'user_name');
const VALID_PROPERTIES = [
  'user_name',
  'email',
  'role',
  'first_name',
  'last_name',
  'password',
];

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
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

export default {
  create: [
    hasOnlyValidProperties(...VALID_PROPERTIES),
    hasRequiredProperties,
    asyncErrorBoundary(createUser),
  ],
};
