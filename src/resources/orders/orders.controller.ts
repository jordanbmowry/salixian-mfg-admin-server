import { Request, Response, NextFunction } from 'express';
import { list, read } from './orders.service';
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

async function orderExists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'orderExists');
  const order = await read(req.params.orderId);
  if (order) {
    res.locals.order = order;
    return next();
  }
  next(new AppError(404, `Order ${req.params.orderId} cannot be found.`));
}

async function listOrders(req: Request, res: Response): Promise<void> {
  logMethod(req, 'listOrders');
  const data = await list();
  res.json({ message: 'List orders', data, status: 'success' });
}

function readOrder(req: Request, res: Response) {
  logMethod(req, 'readOrder');
  res.json({
    status: 'success',
    data: res.locals.order,
    message: 'Read order',
  });
}

export default {
  list: [authenticateJWT, asyncErrorBoundary(listOrders)],
  read: [authenticateJWT, asyncErrorBoundary(orderExists), readOrder],
};
