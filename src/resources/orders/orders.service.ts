import knex from '../../db/connection';
import type { Order } from '../../types/types';

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

export async function read(order_id: string) {
  try {
    return knex('orders').select('*').where({ order_id }).first();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read order ${order_id}: ${error.message}`);
    }
    throw new Error(`Failed to read order ${order_id}.`);
  }
}
