import { Request, Response, NextFunction } from 'express';
import * as UserService from '../../services/user.service';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../../utils/systemInfoSchema';
import { AuthRequest } from '../../types/AuthRequest';
import { CustomError } from '../middlewares/error.middleware'; // Import CustomError

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
      // --- THIS IS THE FIX ---
      // We cast to 'any' here to dynamically delete a property without needing a front-end type.
      delete (validatedData as any).role;
      // --------------------
    }

    const updatedUser = await UserService.updateUserProfile(userId, validatedData);
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
}

/**
 * Changes the password for the currently authenticated user.
 */
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


// --- Admin & IT Support Controllers ---

/**
 * Gets a list of all users.
 */
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json({ status: 'success', data: { users } });
    } catch (error) {
        next(error);
    }
}

/**
 * Gets a single user by their ID.
 */
export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const user = await UserService.getUserProfile(id); // Re-use the profile function
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
}

/**
 * Creates a new user or detects a reassignment conflict.
 */
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

/**
 * Handles assigning an existing user to a system.
 */
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

/**
 * Handles the confirmed reassignment of a user to a new system.
 */
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

/**
 * Manually detaches a user from a system.
 */
export async function detachUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { systemId } = req.params;
        await UserService.detachUserFromSystem(systemId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

/**
 * Updates any user's profile by their ID (Admin only).
 */
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

