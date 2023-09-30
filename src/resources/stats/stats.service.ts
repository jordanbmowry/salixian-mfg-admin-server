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

export async function getMonthlyRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<{ months: string[]; revenues: number[] }> {
  try {
    let query = knex('orders')
      .select(
        knex.raw(
          'EXTRACT(YEAR FROM order_date) as year, EXTRACT(MONTH FROM order_date) as month, SUM(customer_cost) as revenue'
        )
      )
      .groupBy('year', 'month')
      .orderBy('year', 'asc')
      .orderBy('month', 'asc');

    if (startDate && endDate) {
      query.whereBetween('order_date', [startDate, endDate]);
    } else if (!startDate && !endDate) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      query.whereBetween('order_date', [startOfYear, now]);
    }

    const results = await query;

    return {
      months: results.map(
        (r) => `${String(r.month).padStart(2, '0')}-${r.year}`
      ),
      revenues: results.map((r) => parseFloat(r.revenue)),
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch monthly revenue: ${(error as Error).message}`
    );
  }
}

export async function getOrderStatusDistribution(
  startDate?: Date,
  endDate?: Date
): Promise<{ date: string[]; statuses: string[]; counts: number[] }> {
  try {
    let query = knex('orders')
      .select(
        knex.raw(
          'EXTRACT(YEAR FROM order_date) as year, EXTRACT(MONTH FROM order_date) as month, order_status'
        )
      )
      .count('* as count')
      .groupBy('year', 'month', 'order_status')
      .orderBy('year', 'asc')
      .orderBy('month', 'asc')
      .orderBy('order_status', 'asc');

    if (startDate && endDate) {
      query.whereBetween('order_date', [startDate, endDate]);
    } else if (!startDate && !endDate) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      query.whereBetween('order_date', [startOfYear, now]);
    }

    const results = await query;

    return {
      date: results.map((r) => `${String(r.month).padStart(2, '0')}-${r.year}`),
      statuses: results.map((r) => r.order_status as string),
      counts: results.map((r) => parseInt(r.count.toString(), 10)),
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch order status distribution: ${(error as Error).message}`
    );
  }
}
