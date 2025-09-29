import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import { CustomError } from '../api/middlewares/error.middleware';
import { z } from 'zod';
import { createUserSchema, updateUserProfileSchema } from '../utils/systemInfoSchema';

type CreateUserData = z.infer<typeof createUserSchema>

export async function createAndAssignUser(data: CreateUserData) {
  const { email, systemId } = data;

  const targetSystem = await prisma.systemInfo.findUnique({
    where: { id: systemId },
    include: { user: true }
  });

  if (!targetSystem) {
    throw new CustomError('Target system not found', 404);
  }
  if (targetSystem.user) {
    throw new CustomError(`System ${targetSystem.hostname} is already assigned to ${targetSystem.user.fullname}`, 409); 
  }

  
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { system: true } 
  });

  if (existingUser) {
    
    if (existingUser.systemId && existingUser.systemId !== systemId) {
      return {
        reassignmentRequired: true,
        user: existingUser,
        oldSystem: existingUser.system,
        newSystem: targetSystem,
      };
    }
   
    throw new CustomError('This user already exists but has no system assigned. Please detach them first.', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      fullname: data.fullname,
      email: data.email,
      password: hashedPassword,
      sector: data.sector,
      phone: data.phone,
      role: data.role,
      avatarUrl: data.avatarUrl,
      loginDate: new Date(),
      system: {
        connect: { id: systemId },
      },
    },
  });
  
  await prisma.systemInfo.update({
      where: { id: systemId },
      data: { userDetachedAt: null }
  });

  const { password, ...userWithoutPassword } = newUser;
  return { user: userWithoutPassword, reassignmentRequired: false };
}

export async function detachUserFromSystem(systemId: string) {
  const system = await prisma.systemInfo.findUnique({
    where: { id: systemId },
    include: { user: true }
  });

  if (!system) {
    throw new CustomError('System not found', 404);
  }
  if (!system.user) {
    
    return system;
  }

  return prisma.systemInfo.update({
    where: { id: systemId },
    data: {
      user: { disconnect: true },
      userDetachedAt: new Date(),
    },
  });
}

export async function forceReassignUser(userId: string, newSystemId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { systemId: true }
  });
  if (!user || !user.systemId) {
    throw new CustomError('User not found or is not assigned to any system.', 404);
  }

  const oldSystemId = user.systemId;

  if (oldSystemId === newSystemId) {
    throw new CustomError('User is already assigned to this system.', 409);
  }

  return prisma.$transaction(async (tx) => {
    
  
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        system: { connect: { id: newSystemId } },
      },
      include: { 
        system: true 
      }
    });
    
    await tx.systemInfo.update({
      where: { id: oldSystemId },
      data: {
        userDetachedAt: new Date(),
      },
    });

    await tx.systemInfo.update({
        where: { id: newSystemId },
        data: { userDetachedAt: null }
    });

    return updatedUser;
  });
}

type UpdateUserProfileData = z.infer<typeof updateUserProfileSchema>;


export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}


export async function updateUserProfile(userId: string, data: UpdateUserProfileData) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: data, 
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new CustomError('Incorrect current password', 403);
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: 'Password updated successfully' };
}
