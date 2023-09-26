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
import {
  sanitizeRequestBody,
  sanitizeParams,
  sanitizeQuery,
} from '../../utils/sanitizeMiddleware';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { customerSchema } from '../../errors/joiValidationSchemas';
import type { Customer, CustomerListOptions } from '../../types/types';

const DEFAULT_PAGE_PAGINATION = 1;
const DEFAULT_PAGE_SIZE = 10;

async function handleCreate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleCreate');
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
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send({ error: 'Customer ID is required' });
    return;
  }

  const customer = await read(customerId);
  if (customer) {
    res.locals.customer = customer;
    return next();
  }
  next(
    new AppError(
      HttpStatusCode.NOT_FOUND,
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
  try {
    const {
      page = DEFAULT_PAGE_PAGINATION,
      pageSize = DEFAULT_PAGE_SIZE,
      startDate,
      endDate,
      email,
      phoneNumber,
      sortBy,
      order,
    } = req.query;

    const options: CustomerListOptions = {
      page: Number(page),
      pageSize: Number(pageSize),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      email: (email as string) || undefined,
      phoneNumber: (phoneNumber as string) || undefined,
      sortBy: (sortBy as string) || undefined,
      order: (order as 'asc' | 'desc') || undefined,
    };

    const { data, totalCount } = await list(options);

    const meta = {
      currentPage: options.page,
      totalPages: Math.ceil(totalCount / options.pageSize!),
      pageSize: options.pageSize,
      totalCount,
    };

    res.json({
      message: 'List customers',
      data,
      meta,
      status: 'success',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message || 'An error occurred',
        status: 'error',
      });
    } else {
      res.status(500).json({
        message: 'An unknown error occurred',
        status: 'error',
      });
    }
  }
}

async function handleHardDelete(req: Request, res: Response): Promise<void> {
  const { customer } = res.locals;
  logMethod(req, 'handleHardDelete');
  await destroy(customer.customer_id);
  res.sendStatus(HttpStatusCode.NO_CONTENT);
}

async function handleGetCustomerWithOrders(
  req: Request,
  res: Response
): Promise<void> {
  const { customer } = res.locals;
  logMethod(req, 'handleGetCustomerWithOrders');

  const page = Number(req.query.page) || DEFAULT_PAGE_PAGINATION;
  const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
  const orderBy = (req.query.orderBy as string) || 'order_id';
  const order = (req.query.order as 'asc' | 'desc') || 'asc';

  const { data, totalCount } = await fetchOrdersByCustomerId(
    customer.customer_id,
    page,
    pageSize,
    orderBy,
    order
  );

  res.json({
    status: 'success',
    data: {
      orders: data,
      customer,
    },
    meta: {
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
    },
    message: `customer_id ${customer.customer_id} and orders`,
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
  list: [authenticateJWT, sanitizeQuery, asyncErrorBoundary(listCustomers)],
  read: [authenticateJWT, asyncErrorBoundary(customerExists), readCustomer],
  update: [
    authenticateJWT,
    sanitizeRequestBody,
    bodyHasDataProperty,
    sanitizeParams,
    asyncErrorBoundary(customerExists),
    validateDataInBody(customerSchema),
    asyncErrorBoundary(handleUpdate),
  ],
  softDelete: [
    authenticateJWT,
    sanitizeParams,
    asyncErrorBoundary(customerExists),
    asyncErrorBoundary(handleSoftDelete),
  ],
  hardDelete: [
    authenticateJWT,
    ensureAdmin,
    sanitizeParams,
    asyncErrorBoundary(customerExists),
    handleHardDelete,
  ],
  listCustomerWithOrders: [
    authenticateJWT,
    asyncErrorBoundary(customerExists),
    sanitizeQuery,
    asyncErrorBoundary(handleGetCustomerWithOrders),
  ],
};
