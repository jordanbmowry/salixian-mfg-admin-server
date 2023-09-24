import { Request, Response, NextFunction } from 'express';
import { list } from './orders.service';
import hasProperties from '../../errors/hasProperties';
import hasOnlyValidProperties from '../../errors/hasOnlyValidProperties';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { ensureAdmin } from '../../auth/ensureAdmin';

const VALID_ORDER_PROPERTIES = [
  'order_id',
  'order_date',
  'order_description',
  'customer_cost',
  'input_expenses',
  'taxes_fees',
  'shipping_cost',
  'total_write_off',
  'profit',
  'notes',
  'order_status',
  'payment_status',
  'customer_id',
  'created_at',
  'updated_at',
];

async function listOrders(req: Request, res: Response): Promise<void> {
  logMethod(req, 'listOrders');
  const data = await list();
  res.json({ message: 'List orders', data, status: 'success' });
}

export default {
  list: [authenticateJWT, asyncErrorBoundary(listOrders)],
};
