import knex from '../../db/connection';
import type {
  Order,
  Customer,
  CustomerListOptions,
  PaginationResult,
} from '../../types/types';
import { paginate } from '../../utils/paginate';

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
  }
}

export async function read(customer_id: string) {
  try {
    return knex('customers').select('*').where({ customer_id }).first();
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
  }
}

export async function list(
  options: CustomerListOptions = {}
): Promise<PaginationResult<Customer>> {
  let query = knex('customers').whereNull('deleted_at');

  if (options.startDate instanceof Date && options.endDate instanceof Date) {
    query = query.whereBetween('created_at', [
      options.startDate.toISOString(),
      options.endDate.toISOString(),
    ]);
  }

  if (options.email) {
    query = query.where(
      knex.raw('LOWER(email)'),
      'LIKE',
      `${options.email.toLowerCase()}%`
    );
  }

  if (options.phoneNumber) {
    query = query.where(
      knex.raw('LOWER(phone_number)'),
      'LIKE',
      `${options.phoneNumber.toLowerCase()}%`
    );
  }

  if (options.firstName) {
    query = query.where(
      knex.raw('LOWER(first_name)'),
      'LIKE',
      `${options.firstName.toLowerCase()}%`
    );
  }

  if (options.lastName) {
    query = query.where(
      knex.raw('LOWER(last_name)'),
      'LIKE',
      `${options.lastName.toLowerCase()}%`
    );
  }

  const orderBy = options.orderBy || 'customer_id';
  const order = options.order || 'asc';

  return paginate<Customer>(query, {
    page: options.page ?? DEFAULT_PAGE_PAGINATION,
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
    orderBy,
    order,
  });
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
  }
}

export async function fetchOrdersByCustomerId(
  customer_id: string,
  page: number = DEFAULT_PAGE_PAGINATION,
  pageSize: number = DEFAULT_PAGE_SIZE,
  orderBy: string = 'order_id',
  order: 'asc' | 'desc' = 'asc'
): Promise<PaginationResult<Order>> {
  const query = knex('orders').where({ customer_id });
  return paginate<Order>(query, {
    page,
    pageSize,
    orderBy,
    order,
  });
}
