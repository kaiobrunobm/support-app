import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../../services/auth.service';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const result = await AuthService.loginUser(email, password);

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
   
    res.status(200).json({
        status: 'success',
        data: {
            user: (req as any).user, // Type this properly later
        },
    });
}
