import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.post(
    '/', 
    [
        authenticate, 
        upload.single('image')
    ] as any,
    uploadController.uploadImage
);

export default router;
