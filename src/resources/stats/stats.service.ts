import knex from '../../db/connection';

function applyDateFilter(
  query: any,
  column: string,
  startDate?: Date,
  endDate?: Date
) {
  if (startDate && endDate) {
    return query.whereBetween(column, [startDate, endDate]);
  } else if (!startDate && !endDate) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return query.whereBetween(column, [startOfYear, now]);
  }
  return query;
}

export async function calculateRevenue(
  trx: any,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    let query = trx('orders').sum('customer_cost as result');
    query = applyDateFilter(query, 'order_date', startDate, endDate);

    const result = await query;
    return Number(result[0]?.result) || 0;
  } catch (error) {
    throw new Error(`Failed to calculate revenue: ${(error as Error).message}`);
  }
}

export async function countOrders(
  trx: any,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    let query = trx('orders').count('order_id as result');
    query = applyDateFilter(query, 'order_date', startDate, endDate);

    const result = await query;
    return Number(result[0]?.result) || 0;
  } catch (error) {
    throw new Error(`Failed to count orders: ${(error as Error).message}`);
  }
}

export async function countCustomers(
  trx: any,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    let query = trx('customers').count('customer_id as result');
    query = applyDateFilter(query, 'created_at', startDate, endDate);

    const result = await query;
    return Number(result[0]?.result) || 0;
  } catch (error) {
    throw new Error(`Failed to count customers: ${(error as Error).message}`);
  }
}

interface QueryResult {
  month: number;
  year: number;
  revenue?: number;
  order_status?: string;
  count?: number;
}

export async function getMonthlyRevenue(
  trx: any,
  startDate?: Date,
  endDate?: Date
): Promise<{ months: string[]; revenues: number[] }> {
  try {
    let query = trx('orders')
      .select(
        trx.raw(
          'EXTRACT(YEAR FROM order_date) as year, EXTRACT(MONTH FROM order_date) as month, SUM(customer_cost) as revenue'
        )
      )
      .groupBy('year', 'month')
      .orderBy('year', 'asc')
      .orderBy('month', 'asc');
    query = applyDateFilter(query, 'order_date', startDate, endDate);

    const results: any = await query;
    return {
      months: results.map(
        (r: any) => `${String(r.month ?? 0).padStart(2, '0')}-${r.year ?? 0}`
      ),
      revenues: results.map((r: any) => parseFloat(r.revenue)),
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch monthly revenue: ${(error as Error).message}`
    );
  }
}

export async function getOrderStatusDistribution(
  trx: any,
  startDate?: Date,
  endDate?: Date
): Promise<{ date: string[]; statuses: string[]; counts: number[] }> {
  try {
    let query = trx('orders')
      .select(
        trx.raw(
          'EXTRACT(YEAR FROM order_date) as year, EXTRACT(MONTH FROM order_date) as month, order_status'
        )
      )
      .count('* as count')
      .groupBy('year', 'month', 'order_status')
      .orderBy('year', 'asc')
      .orderBy('month', 'asc')
      .orderBy('order_status', 'asc');
    query = applyDateFilter(query, 'order_date', startDate, endDate);

    const results: Array<{
      month: number | undefined;
      year: number | undefined;
      order_status: string;
      count: number;
    }> = await query;
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

type DashboardStats = {
  revenue: number;
  orderCount: number;
  customerCount: number;
  monthlyRevenue: { months: string[]; revenues: number[] };
  orderStatusDistribution: {
    date: string[];
    statuses: string[];
    counts: number[];
  };
};

export async function getAggregateStats(startDate?: Date, endDate?: Date) {
  return knex.transaction(async (trx: any) => {
    try {
      const revenue = await calculateRevenue(trx, startDate, endDate);
      const orderCount = await countOrders(trx, startDate, endDate);
      const customerCount = await countCustomers(trx, startDate, endDate);
      const monthlyRevenue = await getMonthlyRevenue(trx, startDate, endDate);
      const orderStatusDistribution = await getOrderStatusDistribution(
        trx,
        startDate,
        endDate
      );

      return {
        revenue,
        orderCount,
        customerCount,
        monthlyRevenue,
        orderStatusDistribution,
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
}
