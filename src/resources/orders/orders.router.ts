import { Router } from 'express';
import controller from './orders.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const ORDERS_BASE_ROUTE = '/';
const ORDER_ID_ROUTE = '/:orderId([a-fA-F0-9-]{36}|[0-9]+)';
const ORDERS_WITH_CUSTOMERS = '/orders-with-customers';

const router = Router();

router
  .route(ORDERS_BASE_ROUTE)
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route(ORDER_ID_ROUTE)
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route(ORDERS_WITH_CUSTOMERS)
  .get(controller.listOrdersWithCustomers)
  .all(methodNotAllowed);

export default router;
