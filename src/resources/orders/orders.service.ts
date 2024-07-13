import knex from '../../db/connection';
import type {
  Order,
  OrderWithCustomer,
  OrderListOptions,
  PaginationResult,
} from '../../types/types';
import { paginate } from '../../utils/paginate';
import { getCache, setCache, clearCache } from '../../db/nodeCache/nodeCache';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { AppError } from '../../errors/AppError';
import { Knex } from 'knex';

export async function list(nodeCache: string): Promise<Order[]> {
  try {
    const cacheValue = (await getCache(nodeCache)) as Order[];
    if (cacheValue) {
      return cacheValue;
    }
    const result = await knex('orders').select('*');
    await setCache(nodeCache, result);
    return result;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      'Failed to list orders.',
      error
    );
  }
}

export async function read(
  order_id: string,
  nodeCache: string
): Promise<Order> {
  try {
    const cacheValue = (await getCache(nodeCache)) as Order;
    if (cacheValue) {
      return cacheValue;
    }
    const result = await knex('orders').select('*').where({ order_id }).first();
    await setCache(nodeCache, result);
    return result;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to read order ${order_id}.`,
      error
    );
  }
}

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
  options: OrderListOptions = {},
  nodeCache: string
): Promise<PaginationResult<OrderWithCustomer>> {
  try {
    const cacheValue = (await getCache(
      nodeCache
    )) as PaginationResult<OrderWithCustomer>;

    if (cacheValue) {
      return cacheValue;
    }

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
      query = applyTextFilter(query, 'c.phone_number', options.phoneNumber);
    }

    if (options.email) {
      query = applyTextFilter(query, 'c.email', options.email);
    }

    if (options.firstName) {
      query = applyTextFilter(query, 'c.first_name', options.firstName);
    }

    if (options.lastName) {
      query = applyTextFilter(query, 'c.last_name', options.lastName);
    }

    const orderBy = options.orderBy || 'o.order_id';
    const order = options.order || 'asc';

    const result = await paginate<OrderWithCustomer>(query, {
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 10,
      orderBy,
      order,
    });

    await setCache(nodeCache, result);

    return result;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      'Failed to list orders with customers.',
      error
    );
  }
}

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
  } finally {
    await clearCache(['/orders*', '/customers/*', '/stats*']);
  }
}

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
  } finally {
    await clearCache(['/orders*', '/customers/*', '/stats*']);
  }
}

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
  } finally {
    await clearCache(['/orders*', '/customers/*', '/stats*']);
  }
}

export async function hardDelete(order_id: string) {
  try {
    await knex('orders').where({ order_id }).del();
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to delete order ${order_id}.`,
      error
    );
  } finally {
    await clearCache(['/orders*', '/customers/*', '/stats*']);
  }
}
