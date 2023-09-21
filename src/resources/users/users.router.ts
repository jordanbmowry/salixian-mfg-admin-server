// /src/resources/users/users.router.ts

import { Router } from 'express';
import controller from './users.controller';

const router = Router();

// router.get('/', ...controller.list);
router.post('/register', ...controller.create);

export default router;
