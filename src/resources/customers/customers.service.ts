import knex from '../../db/connection';
import { Knex } from 'knex';
import type {
  Order,
  Customer,
  CustomerListOptions,
  PaginationResult,
} from '../../types/types';
import { paginate } from '../../utils/paginate';
import { getCache, setCache, clearCache } from '../../db/redis/redisCache';

const DEFAULT_PAGE_PAGINATION = Number(process.env.DEFAULT_PAGE ?? 1);
const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE ?? 10);

export async function create(customer: Customer) {
  try {
    return await knex('customers')
      .insert(customer)
      .returning('*')
      .then((createdRecords) => createdRecords[0]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
    throw new Error('Failed to create customer.');
  } finally {
    await clearCache(`/customers*`);
  }
}

export async function read(customer_id: string, redisKey: string) {
  try {
    const cacheValue = await getCache(redisKey);
    if (cacheValue) {
      return cacheValue;
    }

    const result = await knex('customers')
      .select('*')
      .where({ customer_id })
      .first();

    await setCache(redisKey, result);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to read customer ${customer_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to read customer ${customer_id}.`);
  }
}

export async function softDelete(customer_id: string): Promise<void> {
  try {
    await knex('customers').where({ customer_id }).update({
      deleted_at: knex.fn.now(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to soft delete customer ${customer_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to soft delete customer ${customer_id}.`);
  } finally {
    await clearCache(`/customers*`);
  }
}

export async function update(updatedCustomer: Partial<Customer>) {
  try {
    return await knex('customers')
      .select('*')
      .where({ customer_id: updatedCustomer.customer_id })
      .update(updatedCustomer, '*');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
    throw new Error('Failed to update customer.');
  } finally {
    await clearCache(`/customers*`);
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

export async function list(
  options: CustomerListOptions = {},
  redisKey: string
): Promise<PaginationResult<Customer>> {
  const {
    startDate,
    endDate,
    email,
    phoneNumber,
    firstName,
    lastName,
    page = DEFAULT_PAGE_PAGINATION,
    pageSize = DEFAULT_PAGE_SIZE,
    orderBy = 'customer_id',
    order = 'asc',
  } = options;

  const cacheValue = await getCache(redisKey);
  if (cacheValue) {
    return cacheValue;
  }

  let query = knex('customers').whereNull('deleted_at');

  if (startDate instanceof Date && endDate instanceof Date) {
    query = query.whereBetween('created_at', [
      startDate.toISOString(),
      endDate.toISOString(),
    ]);
  }

  if (email) applyTextFilter(query, 'email', email);
  if (phoneNumber) applyTextFilter(query, 'phone_number', phoneNumber);
  if (firstName) applyTextFilter(query, 'first_name', firstName);
  if (lastName) applyTextFilter(query, 'last_name', lastName);

  const result = await paginate<Customer>(query, {
    page,
    pageSize,
    orderBy,
    order,
  });

  await setCache(redisKey, {
    ...result,
    pageSize,
  });

  return { ...result, pageSize };
}

export async function destroy(customer_id: string) {
  try {
    await knex('customers').where({ customer_id }).del();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to delete customer ${customer_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to delete customer ${customer_id}.`);
  } finally {
    await clearCache(`/customers*`);
  }
}

export async function fetchOrdersByCustomerId(
  customer_id: string,
  page: number = DEFAULT_PAGE_PAGINATION,
  pageSize: number = DEFAULT_PAGE_SIZE,
  orderBy: string = 'order_id',
  order: 'asc' | 'desc' = 'asc',
  redisKey: string
): Promise<PaginationResult<Order>> {
  const cacheValue = await getCache(redisKey);
  console.log(redisKey);
  console.log('cacheValue', cacheValue);

  if (cacheValue) {
    return cacheValue;
  }

  const query = knex('orders').where({ customer_id });
  const result = await paginate<Order>(query, {
    page,
    pageSize,
    orderBy,
    order,
  });
  console.log(result, {
    ...result,
    pageSize,
  });

  await setCache(redisKey, {
    ...result,
    pageSize,
  });

  return { ...result, pageSize };
}
