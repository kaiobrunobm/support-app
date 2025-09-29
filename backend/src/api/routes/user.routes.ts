import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeAdminOrIT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);
router.post('/me/change-password', authenticate, userController.changePassword);


router.post('/', [authenticate, authorizeAdminOrIT], userController.createUser);
router.post('/reassign', [authenticate, authorizeAdminOrIT], userController.reassignUser);
router.delete('/detach/:systemId', [authenticate, authorizeAdminOrIT], userController.detachUser);


export default router;
