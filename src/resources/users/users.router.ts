import { Router } from 'express';
import controller from './users.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';
import { authenticateJWT } from '../../auth/authMiddleware';
import { ensureAdmin } from '../../auth/ensureAdmin';

const USERS_BASE_ROUTE = '/';
const LOGIN_ROUTE = '/login';
const LOGOUT_ROUTE = '/logout';
const USER_ID_ROUTE = '/:userId([a-fA-F0-9-]{36}|[0-9]+)';
const REGISTER_ROUTE = '/register';
const AUTH_STATUS_ROUTE = '/auth/status';

const router = Router();

// Users base route
router
  .route(USERS_BASE_ROUTE)
  .get(authenticateJWT, ensureAdmin, controller.list)
  .all(methodNotAllowed);

// Login route
router.route(LOGIN_ROUTE).post(controller.login).all(methodNotAllowed);

// Logout route
router
  .route(LOGOUT_ROUTE)
  .get(authenticateJWT, controller.logout)
  .all(methodNotAllowed);

// User ID route
router
  .route(USER_ID_ROUTE)
  .get(authenticateJWT, controller.read)
  .put(authenticateJWT, ensureAdmin, controller.update)
  .delete(authenticateJWT, ensureAdmin, controller.delete)
  .all(methodNotAllowed);

// Register route
router
  .route(REGISTER_ROUTE)
  .post(authenticateJWT, ensureAdmin, controller.create)
  .all(methodNotAllowed);

// Authentication status route
router
  .route(AUTH_STATUS_ROUTE)
  .get(authenticateJWT, controller.checkAuthStatus)
  .all(methodNotAllowed);

export default router;
