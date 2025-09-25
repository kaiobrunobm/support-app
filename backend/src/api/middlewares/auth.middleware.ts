import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';
import { CustomError } from './error.middleware';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            throw new CustomError('User not found', 401);
        }

      
        (req as any).user = user;
        next();
    } catch (error) {
        next(new CustomError('Invalid token', 401));
    }
}
