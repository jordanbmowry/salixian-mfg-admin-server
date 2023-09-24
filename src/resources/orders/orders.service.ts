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
