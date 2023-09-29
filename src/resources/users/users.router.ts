import { Router } from 'express';
import controller from './users.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const USERS_BASE_ROUTE = '/';
const LOGIN_ROUTE = '/login';
const LOGOUT_ROUTE = '/logout';
const USER_ID_ROUTE = '/:userId([a-fA-F0-9-]{36}|[0-9]+)';
const REGISTER_ROUTE = '/register';
const AUTH_STATUS_ROUTE = '/auth/status';

const router = Router();

router.route(USERS_BASE_ROUTE).get(controller.list).all(methodNotAllowed);

router.route(LOGIN_ROUTE).post(controller.login).all(methodNotAllowed);

router.route(LOGOUT_ROUTE).get(controller.logout).all(methodNotAllowed);

router
  .route(USER_ID_ROUTE)
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);

router.route(REGISTER_ROUTE).post(controller.create).all(methodNotAllowed);

router
  .route(AUTH_STATUS_ROUTE)
  .get(controller.checkAuthStatus)
  .all(methodNotAllowed);

export default router;
