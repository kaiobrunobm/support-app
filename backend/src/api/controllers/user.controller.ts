import { Request, Response, NextFunction } from 'express';
import * as UserService from '../../services/user.service';
import { createUserSchema, updateUserProfileSchema, changePasswordSchema} from '../../utils/systemInfoSchema';
import { AuthRequest } from '../../types/AuthRequest';

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

export async function reassignUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, newSystemId } = req.body;
        const updatedUser = await UserService.forceReassignUser(userId, newSystemId);
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
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
    const validatedData = updateUserProfileSchema.parse(req.body);

    const updatedUser = await UserService.updateUserProfile(userId, validatedData);
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const result = await UserService.changeUserPassword(userId, currentPassword, newPassword);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}
