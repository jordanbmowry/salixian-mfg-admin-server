import knex from '../../db/connection';
import { getCache, setCache } from '../../db/redis/redisCache';

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

async function fetchFromCacheOrDb<T>(
  trx: any,
  redisKey: string,
  queryCb: () => any,
  processingCb: (result: any) => T
): Promise<T> {
  const cacheValue: T | null = (await getCache(redisKey)) as T;
  if (cacheValue) {
    return cacheValue;
  }

  const result = await queryCb();
  const processedResult = processingCb(result);
  await setCache(redisKey, processedResult);
  return processedResult;
}

export async function calculateRevenue(
  trx: any,
  redisKey: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  return fetchFromCacheOrDb(
    trx,
    `${redisKey}-calculate-revenue`,
    () => {
      let query = trx('orders').sum('customer_cost as result');
      return applyDateFilter(query, 'order_date', startDate, endDate);
    },
    (result: any) => Number(result[0]?.result) || 0
  );
}

export async function countOrders(
  trx: any,
  redisKey: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  return fetchFromCacheOrDb(
    trx,
    `${redisKey}-count-orders`,
    () => {
      let query = trx('orders').count('order_id as result');
      return applyDateFilter(query, 'order_date', startDate, endDate);
    },
    (result: any) => Number(result[0]?.result) || 0
  );
}

export async function countCustomers(
  trx: any,
  redisKey: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  return fetchFromCacheOrDb(
    trx,
    `${redisKey}-count-customers`,
    () => {
      let query = trx('customers').count('customer_id as result');
      return applyDateFilter(query, 'created_at', startDate, endDate);
    },
    (result: any) => Number(result[0]?.result) || 0
  );
}

export async function getMonthlyRevenue(
  trx: any,
  redisKey: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ months: string[]; revenues: number[] }> {
  return fetchFromCacheOrDb(
    trx,
    `${redisKey}-get-monthly-revenue`,
    () => {
      let query = trx('orders')
        .select(
          trx.raw(
            'EXTRACT(YEAR FROM order_date) as year, EXTRACT(MONTH FROM order_date) as month, SUM(customer_cost) as revenue'
          )
        )
        .groupBy('year', 'month')
        .orderBy('year', 'asc')
        .orderBy('month', 'asc');
      return applyDateFilter(query, 'order_date', startDate, endDate);
    },
    (results: any) => ({
      months: results.map(
        (r: any) => `${String(r.month ?? 0).padStart(2, '0')}-${r.year ?? 0}`
      ),
      revenues: results.map((r: any) => parseFloat(r.revenue)),
    })
  );
}

export async function getOrderStatusDistribution(
  trx: any,
  redisKey: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ date: string[]; statuses: string[]; counts: number[] }> {
  interface OrderStatusResult {
    month: number;
    year: number;
    order_status: string;
    count: number;
  }

  return fetchFromCacheOrDb(
    trx,
    `${redisKey}-get-order-status-distribution`,
    () => {
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
      return applyDateFilter(query, 'order_date', startDate, endDate);
    },
    (results: OrderStatusResult[]) => ({
      date: results.map((r) => `${String(r.month).padStart(2, '0')}-${r.year}`),
      statuses: results.map((r) => r.order_status),
      counts: results.map((r) => parseInt(r.count.toString(), 10)),
    })
  );
}

export async function getAggregateStats(
  redisKey: string,
  startDate?: Date,
  endDate?: Date
) {
  return fetchFromCacheOrDb(
    null,
    `${redisKey}-get-aggregate-stats`,
    async () => {
      return await knex.transaction(async (trx: any) => {
        const revenue = await calculateRevenue(
          trx,
          redisKey,
          startDate,
          endDate
        );
        const orderCount = await countOrders(trx, redisKey, startDate, endDate);
        const customerCount = await countCustomers(
          trx,
          redisKey,
          startDate,
          endDate
        );
        const monthlyRevenue = await getMonthlyRevenue(
          trx,
          redisKey,
          startDate,
          endDate
        );
        const orderStatusDistribution = await getOrderStatusDistribution(
          trx,
          redisKey,
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
      });
    },
    (result: any) => result
  );
}
