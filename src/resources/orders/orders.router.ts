import { Router } from 'express';
import controller from './orders.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const ORDERS_BASE_ROUTE = '/';
const ORDER_ID_ROUTE = '/:orderId([a-fA-F0-9-]{36}|[0-9]+)';

const router = Router();

router.route(ORDERS_BASE_ROUTE).get(controller.list).all(methodNotAllowed);

router.route(ORDER_ID_ROUTE).get(controller.read).all(methodNotAllowed);

export default router;
