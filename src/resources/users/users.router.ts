// /src/resources/users/users.router.ts

import { Router } from 'express';
import controller from './users.controller';

const router = Router();

router.get('/', ...controller.list);

export default router;
