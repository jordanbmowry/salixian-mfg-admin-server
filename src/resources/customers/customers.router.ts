import { Router } from 'express';
import controller from './customers.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const CUSTOMERS_BASE_ROUTE = '/';

const router = Router();

router.route(CUSTOMERS_BASE_ROUTE).get(controller.list).all(methodNotAllowed);

export default router;
