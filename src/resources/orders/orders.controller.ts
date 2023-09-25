import { Request, Response, NextFunction } from 'express';
import {
  list,
  read,
  create,
  listOrdersWithCustomers,
  update,
  softDelete,
} from './orders.service';
import { customerExists } from '../customers/customers.controller';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { Order } from '../../types/types';
import { validateDataInBody } from '../../errors/validateDataInBody';
import { sanitizeRequestBody } from '../../utils/sanitizeMiddleware';
import Joi from 'joi';

const NOT_FOUND = 404;
const BAD_REQUEST = 400;

const orderSchema = Joi.object({
  order_date: Joi.date().required(),
  order_description: Joi.string().allow(null, ''),
  customer_cost: Joi.number().required(),
  input_expenses: Joi.number(),
  taxes_fees: Joi.number(),
  shipping_cost: Joi.number(),
  total_write_off: Joi.number(),
  profit: Joi.number(),
  notes: Joi.string().allow(null, ''),
  order_status: Joi.string()
    .valid('pending', 'in progress', 'complete', 'canceled')
    .required(),
  payment_status: Joi.string()
    .valid('not paid', 'partially paid', 'fully paid')
    .required(),
  customer_id: Joi.string().allow(null, '').required(),
}).unknown(false);

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
  next(
    new AppError(BAD_REQUEST, `Order ${req.params.orderId} cannot be found.`)
  );
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

async function fetchOrdersWithCustomers(
  req: Request,
  res: Response
): Promise<void> {
  logMethod(req, 'fetchOrdersWithCustomers');
  const data = await listOrdersWithCustomers();
  res.json({ message: 'List orders with customers', data, status: 'success' });
}

async function handleCreate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const orderData: Partial<Order> = req.body?.data;
  const createdOrder = await create(orderData);
  res.status(201).json({
    status: 'success',
    data: createdOrder,
    message: 'Created order',
  });
}

async function handleUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const orderData: Partial<Order> = req.body?.data;

  const updatedOrder = {
    ...orderData,
    order_id: res.locals.order.order_id,
  };

  const data = await update(updatedOrder);
  res.json({ status: 'success', data, message: 'Updated order' });
}

async function handleSoftDelete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleSoftDelete');
  const { orderId } = req.params;
  await softDelete(orderId);
  res
    .status(200)
    .json({ message: `Order ${orderId} soft deleted successfully.` });
}

export default {
  list: [authenticateJWT, asyncErrorBoundary(listOrders)],
  read: [authenticateJWT, asyncErrorBoundary(orderExists), readOrder],
  listOrdersWithCustomers: [
    authenticateJWT,
    asyncErrorBoundary(fetchOrdersWithCustomers),
  ],
  create: [
    authenticateJWT,
    sanitizeRequestBody,
    bodyHasDataProperty,
    validateDataInBody(orderSchema),
    asyncErrorBoundary(customerExists),
    asyncErrorBoundary(handleCreate),
  ],
  update: [
    authenticateJWT,
    sanitizeRequestBody,
    bodyHasDataProperty,
    asyncErrorBoundary(orderExists),
    validateDataInBody(orderSchema),
    asyncErrorBoundary(handleUpdate),
  ],
  softDelete: [
    authenticateJWT,
    asyncErrorBoundary(orderExists),
    asyncErrorBoundary(handleSoftDelete),
  ],
};
