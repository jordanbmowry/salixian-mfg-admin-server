import { Request, Response, NextFunction } from 'express';
import asyncErrorBoundary from '../../errors/asyncErrorBoundary';
import { authenticateJWT } from '../../auth/authMiddleware';
import { sanitizeQuery } from '../../utils/sanitizeMiddleware';
import { countOrders, countCustomers, calculateRevenue } from './stats.service';
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

    const [revenue, orderCount, customerCount] = await Promise.all([
      calculateRevenue(startDate, endDate),
      countOrders(startDate, endDate),
      countCustomers(startDate, endDate),
    ]);

    res.json({
      status: 'success',
      data: {
        revenue,
        orderCount,
        customerCount,
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
