import { Request, Response, NextFunction } from 'express';
import config from '../../config/config';
import {
  list,
  read,
  markAsDeleted,
  update,
  hardDelete,
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

import { customerSchema } from '../../errors/joiValidationSchemas';
import type { Customer, CustomerListOptions } from '../../types/types';
import { checkDuplicate } from '../../errors/checkDuplicates';
import { HttpStatusCode } from '../../errors/httpStatusCode';

const { DEFAULT_PAGE_PAGINATION = 1, DEFAULT_PAGE_SIZE = 10 } = process.env;

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

  if (!customerId) {
    return next(
      new AppError(HttpStatusCode.BAD_REQUEST, 'Customer ID is required.')
    );
  }

  await markAsDeleted(customerId);
  res.json({
    status: 'success',
    message: `Customer ${customerId} soft deleted successfully.`,
  });
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
  res.json({
    status: 'success',
    data,
    message: 'Updated customer',
  });
}

export async function customerExists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'customerExists');
  const customerId = req.params.customerId || req.body?.data?.customer_id;

  if (!customerId) {
    return next(
      new AppError(HttpStatusCode.BAD_REQUEST, 'Customer ID is required.')
    );
  }

  try {
    const customer = await read(customerId);
    if (!customer) {
      throw new AppError(
        HttpStatusCode.NOT_FOUND,
        `Customer with ID ${customerId} not found.`
      );
    }
    res.locals.customer = customer;
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    next(
      new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to read customer ${customerId}: ${errorMessage}`
      )
    );
  }
}

function readCustomer(req: Request, res: Response) {
  logMethod(req, 'readCustomer');
  res.json({
    status: 'success',
    data: res.locals.customer,
    message: 'Read customer',
  });
}

async function listCustomers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logMethod(req, 'listCustomers');
    const {
      page = config.defaultPagePagination,
      pageSize = config.defaultPageSize,
      startDate,
      endDate,
      email,
      phoneNumber,
      firstName,
      lastName,
      orderBy,
    } = req.query;

    const order = (req.query.order as 'asc' | 'desc') || 'asc';

    const options: CustomerListOptions = {
      page: Number(page),
      pageSize: Number(pageSize),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      email: (email as string) || undefined,
      phoneNumber: (phoneNumber as string) || undefined,
      firstName: (firstName as string) || undefined,
      lastName: (lastName as string) || undefined,
      orderBy: (orderBy as string) || undefined,
      order,
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
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    next(new AppError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage));
  }
}

async function handleHardDelete(req: Request, res: Response): Promise<void> {
  const { customer } = res.locals;
  await hardDelete(customer.customer_id);
  res.json({
    status: 'success',
    message: `Customer ${customer.customer_id} hard deleted successfully.`,
  });
}

async function handleGetCustomerWithOrders(
  req: Request,
  res: Response
): Promise<void> {
  const { customer } = res.locals;
  const page = Number(req.query.page || DEFAULT_PAGE_PAGINATION);
  const pageSize = Number(req.query.pageSize || DEFAULT_PAGE_SIZE);
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
    checkDuplicate({
      table: 'customers',
      fields: ['email', 'phone_number'],
      primaryKey: 'customer_id',
      paramKey: 'customerId',
    }),
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
    checkDuplicate({
      table: 'customers',
      fields: ['email', 'phone_number'],
      primaryKey: 'customer_id',
      paramKey: 'customerId',
    }),
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
