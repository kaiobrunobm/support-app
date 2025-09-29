import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import * as AuthService from '../../services/auth.service';
import * as UserService from '../../services/user.service';
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

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
   try {

    const userId = req.user!.id; 
    const userProfile = await UserService.getUserProfile(userId);

    res.status(200).json({
        status: 'success',
        data: {
            user: userProfile,
        },
    });
   } catch (error) {
       next(error);
   }
}
