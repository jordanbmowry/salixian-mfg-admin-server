import { Request, Response, NextFunction } from 'express';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import { authenticateJWT } from '../../auth/authMiddleware';
import { sanitizeQuery } from '../../utils/sanitizeMiddleware';
import {
  countOrders,
  countCustomers,
  calculateRevenue,
  getMonthlyRevenue,
  getOrderStatusDistribution,
} from './stats.service';
import { logMethod } from '../../config/logMethod';

function isDateString(value: any): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const timestamp = Date.parse(value);

  return !isNaN(timestamp);
}

export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logMethod(req, 'getDashboardStats');
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (isDateString(req.query.startDate)) {
      startDate = new Date(req.query.startDate);
    }
    if (isDateString(req.query.endDate)) {
      endDate = new Date(req.query.endDate);
    }

    const revenue = await calculateRevenue(startDate, endDate);
    const orderCount = await countOrders(startDate, endDate);
    const customerCount = await countCustomers(startDate, endDate);
    const monthlyRevenue = await getMonthlyRevenue(startDate, endDate);
    const orderStatusDistribution = await getOrderStatusDistribution(
      startDate,
      endDate
    );

    res.json({
      status: 'success',
      data: {
        revenue,
        orderCount,
        customerCount,
        monthlyRevenue,
        orderStatusDistribution,
      },
      message: 'Aggregate stats',
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getDashboardStats: [
    authenticateJWT,
    sanitizeQuery,
    asyncErrorBoundary(getDashboardStats),
  ],
};
