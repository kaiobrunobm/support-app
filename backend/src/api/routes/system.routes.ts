import { Router } from 'express';
import * as systemController from '../controllers/system.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', systemController.upsertSystem);

// router.get('/search', authenticate, systemController.search);
// router.get('/:id', authenticate, systemController.getSystemById);

export default router;
