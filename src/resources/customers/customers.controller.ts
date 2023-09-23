import { Request, Response, NextFunction } from 'express';
import { list } from './customers.service';
import hasProperties from '../../errors/hasProperties';
import hasOnlyValidProperties from '../../errors/hasOnlyValidProperties';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';

async function listCustomers(req: Request, res: Response) {
  logMethod(req, 'listCustomers');
  const data = await list();
  res.json({ message: 'List customers', data, status: 'success' });
}

export default {
  list: [authenticateJWT, asyncErrorBoundary(listCustomers)],
};
