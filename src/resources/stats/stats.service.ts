import knex from '../../db/connection';

export async function calculateRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    let query = knex('orders').sum('customer_cost as result');

    if (startDate && endDate) {
      query.whereBetween('order_date', [startDate, endDate]);
    } else if (!startDate && !endDate) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      query.whereBetween('order_date', [startOfYear, now]);
    }

    const result = await query;
    return Number(result[0]?.result) || 0;
  } catch (error) {
    throw new Error(`Failed to calculate revenue: ${(error as Error).message}`);
  }
}

export async function countOrders(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    let query = knex('orders').count('order_id as result');

    if (startDate && endDate) {
      query.whereBetween('order_date', [startDate, endDate]);
    } else if (!startDate && !endDate) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      query.whereBetween('order_date', [startOfYear, now]);
    }

    const result = await query;
    return Number(result[0]?.result) || 0;
  } catch (error) {
    throw new Error(`Failed to count orders: ${(error as Error).message}`);
  }
}

export async function countCustomers(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    let query = knex('customers').count('customer_id as result');

    if (startDate && endDate) {
      query.whereBetween('created_at', [startDate, endDate]);
    } else if (!startDate && !endDate) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      query.whereBetween('created_at', [startOfYear, now]);
    }

    const result = await query;
    return Number(result[0]?.result) || 0;
  } catch (error) {
    throw new Error(`Failed to count customers: ${(error as Error).message}`);
  }
}
