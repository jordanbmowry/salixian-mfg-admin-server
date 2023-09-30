import { Router } from 'express';
import controller from './stats.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const STATS_ROUTE = '/';

const router = Router();

router
  .route(STATS_ROUTE)
  .get(controller.getDashboardStats)
  .all(methodNotAllowed);

export default router;
