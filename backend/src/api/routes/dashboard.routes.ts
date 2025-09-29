import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorizeAdminOrIT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', [authenticate, authorizeAdminOrIT], dashboardController.getStats);

export default router;
