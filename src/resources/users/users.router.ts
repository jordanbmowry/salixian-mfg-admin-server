import { Router } from 'express';
import controller from './users.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const USER_BASE_ROUTE = '/';
const LOGIN_ROUTE = '/login';
const LOGOUT_ROUTE = '/logout';
const USER_ID_ROUTE = '/:userId([0-9]+)';
const REGISTER_ROUTE = '/register';

const router = Router();

router.route(USER_BASE_ROUTE).get(controller.list).all(methodNotAllowed);

router.route(LOGIN_ROUTE).post(controller.login).all(methodNotAllowed);

router.route(LOGOUT_ROUTE).post(controller.logout).all(methodNotAllowed);

router
  .route(USER_ID_ROUTE)
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);

router.route(REGISTER_ROUTE).post(controller.create).all(methodNotAllowed);

export default router;
