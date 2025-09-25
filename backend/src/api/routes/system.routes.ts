import { Router } from 'express';
import * as systemController from '../controllers/system.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', systemController.upsertSystem);
router.get('/search', [authenticate, authorizeAdmin], systemController.search);
router.get('/:id', [authenticate, authorizeAdmin], systemController.getSystemById);

export default router;
