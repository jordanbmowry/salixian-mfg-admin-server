import { Router } from 'express';
import controller from './users.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const router = Router();

router
  .route('/')
  .get(...controller.list)
  .all(methodNotAllowed);

router
  .route('/login')
  .post(...controller.login)
  .all(methodNotAllowed);

router
  .route('/logout')
  .post(...controller.logout)
  .all(methodNotAllowed);

router
  .route('/:userId([0-9]+)')
  .get(...controller.read)
  .put(...controller.update)
  .delete(...controller.delete)
  .all(methodNotAllowed);

router
  .route('/register')
  .post(...controller.create)
  .all(methodNotAllowed);

export default router;
