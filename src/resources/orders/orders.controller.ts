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
import { generateCacheKey } from '../../utils/generateCacheKey';

const { DEFAULT_PAGE_PAGINATION = 1, DEFAULT_PAGE_SIZE = 10 } = process.env;

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

  const order = await read(
    orderId,
    generateCacheKey(req, res, 'order-exists-check')
  );

  if (order) {
    res.locals.order = order;
    return next();
  }

  next(
    new AppError(HttpStatusCode.NOT_FOUND, `Order ${orderId} cannot be found.`)
  );
}

async function listOrders(req: Request, res: Response): Promise<void> {
  logMethod(req, 'listOrders');
  const data = await list(generateCacheKey(req, res, 'list-orders'));
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

    const options: OrderListOptions = {
      phoneNumber: (phoneNumber as string) || undefined,
      page: Number(page),
      pageSize: Number(pageSize),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      email: (email as string) || undefined,
      firstName: (firstName as string) || undefined,
      lastName: (lastName as string) || undefined,
      orderBy: (orderBy as string) || undefined,
      order: (order as 'asc' | 'desc') || undefined,
    };

    const { data, totalCount } = await listOrdersWithCustomers(
      options,
      generateCacheKey(req, res, 'list-orders-with-customers')
    );

    const meta = {
      currentPage: options.page,
      totalPages: Math.ceil(totalCount / options.pageSize!),
      pageSize: options.pageSize,
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
  res
    .status(HttpStatusCode.NO_CONTENT)
    .json({ message: `Order ${orderId} soft deleted successfully.` });
}

async function handleHardDelete(req: Request, res: Response): Promise<void> {
  const { order } = res.locals;
  logMethod(req, 'handleHardDelete');
  await hardDelete(order.order_id);
  res.sendStatus(HttpStatusCode.NO_CONTENT);
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
    handleHardDelete,
  ],
};
