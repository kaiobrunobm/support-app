import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/error.middleware';

export function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
  
    if (!req.file) {
      throw new CustomError('No image file provided.', 400);
    }

   
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    
    res.status(201).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        url: fileUrl
      }
    });
  } catch (error) {
    next(error);
  }
}
