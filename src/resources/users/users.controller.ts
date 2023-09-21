import { Request, Response, NextFunction } from 'express';

const users = [
  {
    id: 1,
    first_name: 'Jordan',
    last_name: 'Mowry',
    hashed_password: 'blahblah',
    email: 'jordan.mowry@gmail.com',
  },
];

function testMiddlewear(req: Request, res: Response, next: NextFunction) {
  console.log('testMiddlewear');
  next();
}

function list(req: Request, res: Response) {
  res.json({ data: users });
}

export default {
  list: [testMiddlewear, list],
};
