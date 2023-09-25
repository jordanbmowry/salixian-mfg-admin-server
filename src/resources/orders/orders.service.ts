import knex from '../../db/connection';
import type { Order, CustomOrderCustomer } from '../../types/types';

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

export async function listOrdersWithCustomers(): Promise<
  CustomOrderCustomer[]
> {
  try {
    return await knex('orders as o')
      .join('customers as c', 'o.customer_id', 'c.customer_id')
      .select([
        'o.order_id',
        'o.order_date',
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
      .whereNull('c.deleted_at');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list orders with customers: ${error.message}`);
    }
    throw new Error('Failed to list orders with customers.');
  }
}

export async function create(order: Partial<Order>) {
  try {
    return await knex('customers')
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
    return await knex('orders')
      .select('*')
      .where({ order_id: updatedOrder.order_id })
      .update(updatedOrder, '*');
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
