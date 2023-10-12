import knex from '../../db/connection';
import type {
  Order,
  OrderWithCustomer,
  OrderListOptions,
  PaginationResult,
} from '../../types/types';
import { paginate } from '../../utils/paginate';

export async function list(): Promise<Order[]> {
  try {
    return await knex('orders').select('*');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list orders: ${error.message}`);
    }
    throw new Error('Failed to list orders.');
  }
}

export async function read(order_id: string): Promise<Order> {
  try {
    return knex('orders').select('*').where({ order_id }).first();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read order ${order_id}: ${error.message}`);
    }
    throw new Error(`Failed to read order ${order_id}.`);
  }
}

export async function listOrdersWithCustomers(
  options: OrderListOptions = {}
): Promise<PaginationResult<OrderWithCustomer>> {
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

  if (options.startDate && options.endDate) {
    query = query.whereBetween('o.created_at', [
      options.startDate.toISOString(),
      options.endDate.toISOString(),
    ]);
  }

  if (options.phoneNumber) {
    query = query.where(
      knex.raw('LOWER(c.phone_number)'),
      'LIKE',
      `${options.phoneNumber.toLowerCase()}%`
    );
  }

  if (options.email) {
    query = query.where(
      knex.raw('LOWER(c.email)'),
      'LIKE',
      `${options.email.toLowerCase()}%`
    );
  }

  if (options.firstName) {
    query = query.where(
      knex.raw('LOWER(c.first_name)'),
      'LIKE',
      `${options.firstName.toLowerCase()}%`
    );
  }

  if (options.lastName) {
    query = query.where(
      knex.raw('LOWER(c.last_name)'),
      'LIKE',
      `${options.lastName.toLowerCase()}%`
    );
  }

  const orderBy = options.orderBy || 'o.order_id';
  const order = options.order || 'asc';

  return paginate<OrderWithCustomer>(query, {
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 10,
    orderBy,
    order,
  });
}

export async function create(order: Partial<Order>) {
  try {
    return await knex('orders')
      .insert(order)
      .returning('*')
      .then((createdRecords) => createdRecords[0]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
    throw new Error('Failed to create order.');
  }
}

export async function update(updatedOrder: Partial<Order>) {
  try {
    const { order_id } = updatedOrder;
    return await knex('orders').where({ order_id }).update(updatedOrder, '*');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to update order ${updatedOrder.order_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to update order ${updatedOrder.order_id}.`);
  }
}

export async function softDelete(order_id: string): Promise<void> {
  try {
    await knex('orders').where({ order_id }).update({
      deleted_at: knex.fn.now(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to soft delete order ${order_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to soft delete order ${order_id}.`);
  }
}

export async function destroy(order_id: string) {
  try {
    await knex('orders').where({ order_id }).del();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete order ${order_id}: ${error.message}`);
    }
    throw new Error(`Failed to delete order ${order_id}.`);
  }
}
