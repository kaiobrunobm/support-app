import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { authenticate, authorizeAdminOrIT } from '../middlewares/auth.middleware';

const router = Router();


router.get('/systems/:id', [authenticate, authorizeAdminOrIT], historyController.getSystemHistory);

router.get('/tickets/:id', [authenticate, authorizeAdminOrIT], historyController.getTicketHistory);

export default router;
