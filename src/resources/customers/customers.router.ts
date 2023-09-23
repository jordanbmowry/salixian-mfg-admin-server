import { Router } from 'express';
import controller from './customers.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const CUSTOMERS_BASE_ROUTE = '/';
const CUSTOMER_ID_ROUTE = '/:customerId([a-fA-F0-9-]{36}|[0-9]+)';
const SOFT_DELETE_ROUTE = '/soft-delete/:customerId([a-fA-F0-9-]{36}|[0-9]+)';
const HARD_DELETE_ROUTE = '/hard-delete/:customerId([a-fA-F0-9-]{36}|[0-9]+)';
const ORDERS_FOR_CUSTOMER_ROUTE =
  '/:customerId([a-fA-F0-9-]{36}|[0-9]+)/orders';

const router = Router();

router
  .route(CUSTOMERS_BASE_ROUTE)
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route(CUSTOMER_ID_ROUTE)
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route(SOFT_DELETE_ROUTE)
  .delete(controller.softDelete)
  .all(methodNotAllowed);

router
  .route(HARD_DELETE_ROUTE)
  .delete(controller.hardDelete)
  .all(methodNotAllowed);

router
  .route(ORDERS_FOR_CUSTOMER_ROUTE)
  .get(controller.listCustomerWithOrders)
  .all(methodNotAllowed);

export default router;
