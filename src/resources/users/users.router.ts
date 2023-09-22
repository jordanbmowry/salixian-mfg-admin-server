import { Router } from 'express';
import controller from './users.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

const router = Router();

router
  .route('/:userId([0-9]+)')
  .get(...controller.read)
  .put(...controller.update)
  .all(methodNotAllowed);

router
  .route('/register')
  .post(...controller.create)
  .all(methodNotAllowed);

export default router;
