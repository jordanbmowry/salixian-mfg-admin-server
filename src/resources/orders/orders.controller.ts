import { Request, Response, NextFunction } from 'express';
import { list, read, create, listOrdersWithCustomers } from './orders.service';
import { customerExists } from '../customers/customers.controller';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { Order } from '../../types/types';
import { validateDataInBody } from '../../errors/validateDataInBody';
import Joi from 'joi';

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

export default {
  list: [authenticateJWT, asyncErrorBoundary(listOrders)],
  read: [authenticateJWT, asyncErrorBoundary(orderExists), readOrder],
  listOrdersWithCustomers: [
    authenticateJWT,
    asyncErrorBoundary(fetchOrdersWithCustomers),
  ],
  create: [
    authenticateJWT,
    bodyHasDataProperty,
    validateDataInBody(orderSchema),
    asyncErrorBoundary(customerExists),
    asyncErrorBoundary(handleCreate),
  ],
};
