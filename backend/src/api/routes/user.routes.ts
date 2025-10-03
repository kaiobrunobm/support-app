import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeAdmin, authorizeAdminOrIT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);
router.post('/me/change-password', authenticate, userController.changePassword);


router.get('/', [authenticate, authorizeAdminOrIT], userController.getAllUsers);


router.post('/', [authenticate, authorizeAdminOrIT], userController.createUser);


router.post('/assign-existing', [authenticate, authorizeAdminOrIT], userController.assignExistingUser);

router.post('/reassign', [authenticate, authorizeAdminOrIT], userController.reassignUser);

router.delete('/detach/:systemId', [authenticate, authorizeAdminOrIT], userController.detachUser);


router.get('/:id', [authenticate, authorizeAdmin], userController.getUserById);
router.patch('/:id', [authenticate, authorizeAdmin], userController.updateUser);


export default router;

