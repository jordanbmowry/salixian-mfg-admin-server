import knex from '../../db/connection';
import type {
  Order,
  OrderWithCustomer,
  OrderListOptions,
  PaginationResult,
} from '../../types/types';
import { paginate } from '../../utils/paginate';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { AppError } from '../../errors/AppError';
import { Knex } from 'knex';
import config from '../../config/config';

// Function to list all orders
export async function list(): Promise<Order[]> {
  try {
    return await knex('orders').select('*');
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      'Failed to list orders.',
      error
    );
  }
}

// Function to read a specific order by ID
export async function read(order_id: string): Promise<Order> {
  try {
    return await knex('orders').select('*').where({ order_id }).first();
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to read order ${order_id}.`,
      error
    );
  }
}
const DEFAULT_PAGE_PAGINATION = 1;
const DEFAULT_PAGE_SIZE = 10;

function applyTextFilter(
  query: Knex.QueryBuilder,
  column: string,
  value: string
): Knex.QueryBuilder {
  return query.where(
    knex.raw('LOWER(??)', [column]),
    'LIKE',
    `${value.toLowerCase()}%`
  );
}

export async function listOrdersWithCustomers(
  options: OrderListOptions = {}
): Promise<PaginationResult<OrderWithCustomer>> {
  try {
    const {
      startDate,
      endDate,
      email,
      phoneNumber,
      firstName,
      lastName,
      page = DEFAULT_PAGE_PAGINATION,
      pageSize = DEFAULT_PAGE_SIZE,
      orderBy = 'o.order_id',
      order = 'asc',
    } = options;

    let query = knex('orders as o')
      .join('customers as c', 'o.customer_id', 'c.customer_id')
      .select([
        'o.order_id',
        'o.order_date',
        'o.updated_at',
        'o.order_status',
        'o.payment_status',
        'o.created_at as order_created_at',
        'c.first_name',
        'c.last_name',
        'c.customer_id',
        'c.email',
        'c.phone_number',
        'c.created_at as customer_created_at',
        'c.updated_at as customer_updated_at',
      ])
      .whereNull('c.deleted_at')
      .whereNull('o.deleted_at');

    if (startDate && endDate) {
      query = query.whereBetween('o.created_at', [
        startDate.toISOString(),
        endDate.toISOString(),
      ]);
    }

    if (email) applyTextFilter(query, 'c.email', email);
    if (phoneNumber) applyTextFilter(query, 'c.phone_number', phoneNumber);
    if (firstName) applyTextFilter(query, 'c.first_name', firstName);
    if (lastName) applyTextFilter(query, 'c.last_name', lastName);

    const paginationOptions = {
      page: Math.max(Number(page) || DEFAULT_PAGE_PAGINATION, 1),
      pageSize: Math.max(Number(pageSize) || DEFAULT_PAGE_SIZE, 1),
      orderBy,
      order,
    };

    const result = await paginate<OrderWithCustomer>(query, paginationOptions);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to list orders with customers: ${error.message}`
      );
    }
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      'Failed to list orders with customers.'
    );
  }
}

// Function to create a new order
export async function create(order: Partial<Order>) {
  try {
    const createdOrder = await knex('orders')
      .insert(order)
      .returning('*')
      .then((createdRecords) => createdRecords[0]);
    return createdOrder;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      'Failed to create order.',
      error
    );
  }
}

// Function to update an existing order
export async function update(updatedOrder: Partial<Order>) {
  try {
    const { order_id } = updatedOrder;
    return await knex('orders').where({ order_id }).update(updatedOrder, '*');
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to update order ${updatedOrder.order_id}.`,
      error
    );
  }
}

// Function to mark an order as deleted (soft delete)
export async function markAsDeleted(order_id: string): Promise<void> {
  try {
    await knex('orders').where({ order_id }).update({
      deleted_at: knex.fn.now(),
    });
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to soft delete order ${order_id}.`,
      error
    );
  }
}

// Function to hard delete an order
export async function hardDelete(order_id: string) {
  try {
    await knex('orders').where({ order_id }).del();
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to delete order ${order_id}.`,
      error
    );
  }
}
