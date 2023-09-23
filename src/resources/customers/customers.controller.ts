import { Request, Response, NextFunction } from 'express';
import { list, read, softDelete, update } from './customers.service';
import type { Customer } from './customers.service';
import hasProperties from '../../errors/hasProperties';
import hasOnlyValidProperties from '../../errors/hasOnlyValidProperties';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';

const VALID_PROPERTIES = [
  'first_name',
  'last_name',
  'customer_id',
  'email',
  'phone_number',
  'shipping_address',
  'shipping_city',
  'shipping_state',
  'shipping_zip',
  'billing_address',
  'billing_city',
  'billing_state',
  'billing_zip',
  'notes',
  'isDeleted',
];

const hasOnlyValidCustomerProps = hasOnlyValidProperties(...VALID_PROPERTIES);
const hasRequiredProperties = hasProperties(
  'first_name',
  'last_name',
  'email',
  'phone_number'
);

async function handleSoftDelete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { customerId } = req.params;
  await softDelete(customerId);
  res.status(200).json({ message: 'Customer soft deleted successfully.' });
}

async function handleUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const updateData: Partial<Customer> = req.body?.data ?? {};

  const updatedCustomer = {
    ...updateData,
    customer_id: res.locals.customer.customer_id,
  };

  const data = await update(updatedCustomer);
  res.json({ status: 'success', data, message: 'Updated customer' });
}

async function customerExists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'customerExists');
  const customer = await read(req.params.customerId);
  if (customer) {
    res.locals.customer = customer;
    return next();
  }
  next(new AppError(404, `Customer cannot be found.`));
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
  const data = await list();
  res.json({ message: 'List customers', data, status: 'success' });
}

export default {
  list: [authenticateJWT, asyncErrorBoundary(listCustomers)],
  read: [authenticateJWT, asyncErrorBoundary(customerExists), readCustomer],
  update: [
    authenticateJWT,
    bodyHasDataProperty,
    asyncErrorBoundary(customerExists),
    hasRequiredProperties,
    hasOnlyValidCustomerProps,
    asyncErrorBoundary(handleUpdate),
  ],
  softDelete: [
    authenticateJWT,
    asyncErrorBoundary(customerExists),
    asyncErrorBoundary(handleSoftDelete),
  ],
};
