import { Request, Response, NextFunction } from 'express';
import {
  list,
  read,
  create,
  listOrdersWithCustomers,
  update,
  markAsDeleted,
  hardDelete,
} from './orders.service';
import { customerExists } from '../customers/customers.controller';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import bodyHasDataProperty from '../../errors/bodyHasDataProperty';
import { AppError } from '../../errors/AppError';
import { logMethod } from '../../config/logMethod';
import { authenticateJWT } from '../../auth/authMiddleware';
import { Order, OrderListOptions } from '../../types/types';
import { validateDataInBody } from '../../errors/validateDataInBody';
import {
  sanitizeRequestBody,
  sanitizeParams,
  sanitizeQuery,
} from '../../utils/sanitizeMiddleware';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { orderSchema } from '../../errors/joiValidationSchemas';

const { DEFAULT_PAGE_PAGINATION = 1, DEFAULT_PAGE_SIZE = 10 } = process.env;

// Middleware to check if an order exists by ID
async function orderExists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'orderExists');
  const orderId = req.params.orderId;

  if (!orderId) {
    return next(
      new AppError(HttpStatusCode.BAD_REQUEST, 'Order ID is required.')
    );
  }

  const order = await read(orderId);

  if (order) {
    res.locals.order = order;
    return next();
  }

  next(
    new AppError(HttpStatusCode.NOT_FOUND, `Order ${orderId} cannot be found.`)
  );
}

// Handler to list all orders
async function listOrders(req: Request, res: Response): Promise<void> {
  logMethod(req, 'listOrders');
  const data = await list();
  res.json({ message: 'List orders', data, status: 'success' });
}

// Handler to read a specific order
function readOrder(req: Request, res: Response) {
  logMethod(req, 'readOrder');
  res.json({
    status: 'success',
    data: res.locals.order,
    message: 'Read order',
  });
}

// Handler to fetch orders with customer details

async function fetchOrdersWithCustomers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page = DEFAULT_PAGE_PAGINATION,
      pageSize = DEFAULT_PAGE_SIZE,
      startDate,
      endDate,
      firstName,
      lastName,
      email,
      orderBy,
      order,
      phoneNumber,
    } = req.query;

    const options = {
      phoneNumber: phoneNumber as string,
      page: Math.max(Number(page) || (DEFAULT_PAGE_PAGINATION as number), 1),
      pageSize: Math.max(Number(pageSize) || (DEFAULT_PAGE_SIZE as number), 1),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      email: email as string,
      firstName: firstName as string,
      lastName: lastName as string,
      orderBy: orderBy as string,
      order: order as 'asc' | 'desc',
    };

    const {
      data,
      totalCount,
      currentPage,
      totalPages,
      pageSize: size,
    } = await listOrdersWithCustomers(options);

    const meta = {
      currentPage,
      totalPages,
      pageSize: size,
      totalCount,
    };

    res.json({
      message: 'List orders with customers',
      data,
      meta,
      status: 'success',
    });
  } catch (error) {
    next(
      new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        'An unknown error occurred',
        error
      )
    );
  }
}

// Handler to create a new order
async function handleCreate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleCreate');

  const orderData: Partial<Order> = req.body?.data;

  if (!orderData) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, 'Invalid order data');
  }

  const createdOrder = await create(orderData);
  res.status(HttpStatusCode.CREATED).json({
    status: 'success',
    data: createdOrder,
    message: 'Created order',
  });
}

// Handler to update an existing order
async function handleUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleUpdate');
  const orderData: Partial<Order> = req.body?.data;

  const updatedOrder = {
    ...orderData,
    order_id: res.locals.order.order_id,
  };

  const data = await update(updatedOrder);
  res.json({ status: 'success', data, message: 'Updated order' });
}

// Handler to mark an order as deleted (soft delete)
async function handleSoftDelete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logMethod(req, 'handleSoftDelete');
  const { orderId } = req.params;

  if (!orderId) {
    return next(
      new AppError(HttpStatusCode.BAD_REQUEST, 'Order ID is required.')
    );
  }

  await markAsDeleted(orderId);
  res.status(HttpStatusCode.OK).json({
    status: 'success',
    message: `Order ${orderId} soft deleted successfully.`,
  });
}

// Handler to hard delete an order
async function handleHardDelete(req: Request, res: Response): Promise<void> {
  const { order } = res.locals;
  logMethod(req, 'handleHardDelete');
  await hardDelete(order.order_id);
  res.status(HttpStatusCode.OK).json({
    status: 'success',
    message: `Order ${order.order_id} hard deleted successfully.`,
  });
}

export default {
  list: [authenticateJWT, sanitizeQuery, asyncErrorBoundary(listOrders)],
  read: [
    authenticateJWT,
    sanitizeParams,
    asyncErrorBoundary(orderExists),
    readOrder,
  ],
  listOrdersWithCustomers: [
    authenticateJWT,
    sanitizeQuery,
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
    sanitizeParams,
    bodyHasDataProperty,
    asyncErrorBoundary(orderExists),
    asyncErrorBoundary(customerExists),
    validateDataInBody(orderSchema),
    asyncErrorBoundary(handleUpdate),
  ],
  softDelete: [
    authenticateJWT,
    sanitizeParams,
    asyncErrorBoundary(orderExists),
    asyncErrorBoundary(handleSoftDelete),
  ],
  hardDelete: [
    authenticateJWT,
    sanitizeParams,
    asyncErrorBoundary(orderExists),
    asyncErrorBoundary(handleHardDelete),
  ],
};
