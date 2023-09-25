import { Request, Response, NextFunction } from 'express';
import {
  list,
  read,
  softDelete,
  update,
  destroy,
  create,
  fetchOrdersByCustomerId,
} from './customers.service';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { ensureAdmin } from '../../auth/ensureAdmin';
import { validateDataInBody } from '../../errors/validateDataInBody';
import { sanitizeRequestBody } from '../../utils/sanitizeMiddleware';
import Joi from 'joi';
import type { Customer, CustomerListOptions } from '../../types/types';

const NOT_FOUND = 404;
const BAD_REQUEST = 400;

const customerSchema = Joi.object({
  customer_id: Joi.string(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  shipping_address: Joi.string().allow(null, ''),
  shipping_city: Joi.string().allow(null, ''),
  shipping_state: Joi.string().allow(null, ''),
  shipping_zip: Joi.string().allow(null, ''),
  billing_address: Joi.string().allow(null, ''),
  billing_city: Joi.string().allow(null, ''),
  billing_state: Joi.string().allow(null, ''),
  billing_zip: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  created_at: Joi.date(),
  updated_at: Joi.date(),
  deleted_at: Joi.date().allow(null),
}).unknown(false);

async function handleCreate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const customerData: Customer = req.body?.data;
  const createdCustomer = await create(customerData);
  res.status(201).json({
    status: 'success',
    data: createdCustomer,
    message: 'Created customer',
  });
}

async function handleSoftDelete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleSoftDelete');
  const { customerId } = req.params;
  await softDelete(customerId);
  res
    .status(200)
    .json({ message: `Customer ${customerId} soft deleted successfully.` });
}

async function handleUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleUpdate');
  const updateData: Partial<Customer> = req.body?.data ?? {};

  const updatedCustomer = {
    ...updateData,
    customer_id: res.locals.customer.customer_id,
  };

  const data = await update(updatedCustomer);
  res.json({ status: 'success', data, message: 'Updated customer' });
}

export async function customerExists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'customerExists');
  const customerId = req.params.customerId ?? req.body.data.customer_id;

  if (!customerId) {
    res.status(BAD_REQUEST).send({ error: 'Customer ID is required' });
    return;
  }

  const customer = await read(customerId);
  if (customer) {
    res.locals.customer = customer;
    return next();
  }
  next(
    new AppError(
      NOT_FOUND,
      `Customer ${req.params.customerId} cannot be found.`
    )
  );
}

function readCustomer(req: Request, res: Response) {
  logMethod(req, 'readCustomer');
  res.json({
    status: 'success',
    data: res.locals.customer,
    message: 'Read customer',
  });
}

async function listCustomers(req: Request, res: Response): Promise<void> {
  logMethod(req, 'listCustomers');
  const options: CustomerListOptions = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
  };

  if (req.query.startDate && req.query.startDate !== 'undefined') {
    options.startDate = new Date(req.query.startDate as string);
  }
  if (req.query.endDate && req.query.endDate !== 'undefined') {
    options.endDate = new Date(req.query.endDate as string);
  }
  if (req.query.email && req.query.email !== 'undefined') {
    options.email = req.query.email as string;
  }
  if (req.query.phoneNumber && req.query.phoneNumber !== 'undefined') {
    options.phoneNumber = req.query.phoneNumber as string;
  }

  const data = await list({
    page: options.page,
    pageSize: options.pageSize,
    startDate: options.startDate,
    endDate: options.endDate,
    email: options.email,
    phoneNumber: options.phoneNumber,
  });

  res.json({ message: 'List customers', data, status: 'success' });
}

async function handleHardDelete(req: Request, res: Response): Promise<void> {
  const { customer } = res.locals;
  logMethod(req, 'handleHardDelete');
  await destroy(customer.customer_id);
  res.sendStatus(204);
}

async function handleGetCustomerWithOrders(
  req: Request,
  res: Response
): Promise<void> {
  const { customer } = res.locals;
  logMethod(req, 'handleGetCustomerWithOrders');
  const orders = await fetchOrdersByCustomerId(customer.customer_id);

  res.json({
    status: 'success',
    data: {
      orders,
      customer,
    },
    message: `customer_id ${customer.customer_id} and orders inner join`,
  });
}

export default {
  create: [
    authenticateJWT,
    sanitizeRequestBody,
    bodyHasDataProperty,
    validateDataInBody(customerSchema),
    asyncErrorBoundary(handleCreate),
  ],
  list: [authenticateJWT, asyncErrorBoundary(listCustomers)],
  read: [authenticateJWT, asyncErrorBoundary(customerExists), readCustomer],
  update: [
    authenticateJWT,
    sanitizeRequestBody,
    bodyHasDataProperty,
    asyncErrorBoundary(customerExists),
    validateDataInBody(customerSchema),
    asyncErrorBoundary(handleUpdate),
  ],
  softDelete: [
    authenticateJWT,
    asyncErrorBoundary(customerExists),
    asyncErrorBoundary(handleSoftDelete),
  ],
  hardDelete: [
    authenticateJWT,
    ensureAdmin,
    asyncErrorBoundary(customerExists),
    handleHardDelete,
  ],
  listCustomerWithOrders: [
    authenticateJWT,
    asyncErrorBoundary(customerExists),
    asyncErrorBoundary(handleGetCustomerWithOrders),
  ],
};
