import { Router } from 'express';
import * as systemController from '../controllers/system.controller';
import { authenticate, authorizeAdmin, authorizeAdminOrIT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', systemController.upsertSystem);
router.get('/', [authenticate, authorizeAdminOrIT], systemController.getAllSystems);
router.get('/search', [authenticate, authorizeAdmin], systemController.search);
router.patch('/:id', [authenticate, authorizeAdminOrIT], systemController.updateSystem);
router.get('/:id', [authenticate, authorizeAdmin], systemController.getSystemById);

export default router;
