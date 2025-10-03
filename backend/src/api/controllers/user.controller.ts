import { Request, Response, NextFunction } from 'express';
import * as UserService from '../../services/user.service';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../../utils/systemInfoSchema';
import { AuthRequest } from '../../types/AuthRequest';
import { CustomError } from '../middlewares/error.middleware'; 

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const userProfile = await UserService.getUserProfile(userId);
    res.status(200).json({ status: 'success', data: { user: userProfile } });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedData = updateUserSchema.parse(req.body);

    if ('role' in validatedData && req.user?.role !== 'ADMIN') {
      delete (validatedData as any).role;

    }

    const updatedUser = await UserService.updateUserProfile(userId, validatedData);
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        throw new CustomError('Senha antiga e nova senha são obrigatórias', 400);
      }
      const result = await UserService.changeUserPassword(id, oldPassword, newPassword);
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  };

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json({ status: 'success', data: { users } });
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const user = await UserService.getUserProfile(id); // Re-use the profile function
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const result = await UserService.createAndAssignUser(validatedData);

    if (result.reassignmentRequired) {
      return res.status(200).json({
        status: 'reassignment_required',
        data: result,
      });
    }

    res.status(201).json({
      status: 'success',
      data: { user: result.user },
    });
  } catch (error) {
    next(error);
  }
}

export async function assignExistingUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, systemId } = req.body;
        if (!userId || !systemId) {
            throw new CustomError('Both userId and systemId are required', 400);
        }
        const result = await UserService.assignExistingUser(userId, systemId);

        if (result.reassignmentRequired) {
             return res.status(200).json({
                status: 'reassignment_required',
                data: result,
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user: result.user }
        });
    } catch (error) {
        next(error);
    }
}

export async function reassignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { userId, newSystemId } = req.body;
        if (!userId || !newSystemId) {
            return res.status(400).json({ status: 'error', message: 'Both userId and newSystemId are required.' });
        }
        const updatedUser = await UserService.forceReassignUser(userId, newSystemId);
        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (error) {
        next(error);
    }
}

export async function detachUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { systemId } = req.params;
        await UserService.detachUserFromSystem(systemId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const validatedData = updateUserSchema.parse(req.body);

        // Prevent non-admins from changing roles on this endpoint either
        if ('role' in validatedData && req.user?.role !== 'ADMIN') {
            delete (validatedData as any).role;
        }

        const updatedUser = await UserService.updateUserById(id, validatedData);
        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (error) {
        next(error);
    }
}

