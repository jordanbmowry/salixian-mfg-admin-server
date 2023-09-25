import knex from '../../db/connection';
import type { Customer, CustomerListOptions } from '../../types/types';

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
): Promise<{ customers: Customer[]; totalCount: number }> {
  try {
    let query = knex('customers').whereNull('deleted_at');

    // Apply filters to the query
    if (options.startDate instanceof Date && options.endDate instanceof Date) {
      query = query.whereBetween('created_at', [
        options.startDate.toISOString(),
        options.endDate.toISOString(),
      ]);
    }

    if (options.email) {
      query = query.where('email', options.email);
    }
    if (options.phoneNumber) {
      query = query.where('phone_number', options.phoneNumber);
    }

    // First, get the total count
    const totalCountResult = await query.clone().count('* as count').first();
    const totalCount = totalCountResult
      ? parseInt(totalCountResult.count as string, 10)
      : 0;

    // Apply pagination to the query
    const page = options.page || DEFAULT_PAGE_PAGINATION;
    const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;

    const customers = await query
      .select('*')
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { customers, totalCount };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list customers: ${error.message}`);
    }
    throw new Error(`Failed to list customers.`);
  }
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
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  try {
    const ordersQuery = knex('orders')
      .where({ customer_id })
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totalCountQuery = knex('orders')
      .where({ customer_id })
      .count({ totalCount: '*' });

    const [orders, [{ totalCount }]] = await Promise.all([
      ordersQuery,
      totalCountQuery,
    ]);

    return { orders, totalCount };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to list orders for customer ${customer_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to list orders for customer ${customer_id}.`);
  }
}
