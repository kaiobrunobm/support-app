import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import { CustomError } from '../api/middlewares/error.middleware';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../utils/systemInfoSchema';

type CreateUserData = z.infer<typeof createUserSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;

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
    throw new CustomError('This user already exists but has no system assigned.', 409);
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
      system: { connect: { id: systemId } },
    },
  });
  
  await prisma.systemInfo.update({
      where: { id: systemId },
      data: { userDetachedAt: null }
  });

  const { password, ...userWithoutPassword } = newUser;
  return { user: userWithoutPassword, reassignmentRequired: false };
}


export async function assignExistingUser(userId: string, targetSystemId: string) {
    const userToAssign = await prisma.user.findUnique({
        where: { id: userId },
        include: { system: true }
    });

    if (!userToAssign) {
        throw new CustomError('User not found', 404);
    }
    
    const targetSystem = await prisma.systemInfo.findUnique({ where: { id: targetSystemId }, include: { user: true }});
    if (!targetSystem) { throw new CustomError('Target system not found', 404); }
    if (targetSystem.user) { throw new CustomError(`System ${targetSystem.hostname} is already assigned`, 409); }

    if (userToAssign.systemId && userToAssign.systemId !== targetSystemId) {
        return {
            reassignmentRequired: true,
            user: userToAssign,
            oldSystem: userToAssign.system,
            newSystem: targetSystem,
        };
    }

    const updatedUser = await forceReassignUser(userId, targetSystemId);
    return { user: updatedUser, reassignmentRequired: false };
}


export async function forceReassignUser(userId: string, newSystemId: string) {
  return prisma.$transaction(async (tx) => {
    const userToMove = await tx.user.findUnique({
      where: { id: userId },
      select: { systemId: true }
    });
    const oldSystemId = userToMove?.systemId;

    const targetSystem = await tx.systemInfo.findUnique({
      where: { id: newSystemId },
      select: { user: { select: { id: true } } }
    });
    const occupantUserId = targetSystem?.user?.id;

    if (occupantUserId) {
      await tx.user.update({
        where: { id: occupantUserId },
        data: { systemId: null }
      });
      await tx.systemInfo.update({
          where: { id: newSystemId },
          data: { userDetachedAt: new Date() }
      });
    }

    if (oldSystemId) {
       await tx.systemInfo.update({
          where: { id: oldSystemId },
          data: { userDetachedAt: new Date() }
      });
    }
    
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { system: { connect: { id: newSystemId } } },
      include: { system: true }
    });

    await tx.systemInfo.update({
        where: { id: newSystemId },
        data: { userDetachedAt: null }
    });

    return updatedUser;
  });
}


export async function detachUserFromSystem(systemId: string) {
  const system = await prisma.systemInfo.findUnique({
    where: { id: systemId },
    select: { user: { select: { id: true } } }
  });

  if (!system) {
    throw new CustomError('System not found', 404);
  }
  if (!system.user) {
    return;
  }

  const userId = system.user.id;

  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { systemId: null }
    }),
    prisma.systemInfo.update({
      where: { id: systemId },
      data: { userDetachedAt: new Date() },
    })
  ]);
}

export async function getAllUsers() {
  return prisma.user.findMany({
    include: {
      system: {
        select: {
          id: true,
          hostname: true,
        },
      },
    },
    orderBy: [
      { systemId: 'desc' },
      { fullname: 'asc' },
    ],
  });
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      system: {
        include: {
          user: true,
          computerUsers: true,
          hardware: { include: { cpu: true, memory: true } },
          network: { include: { adapters: true } },
          disks: true,
          printers: true,
        },
      },
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserProfile(userId: string, data: Partial<UpdateUserData>) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: data,
  });

  if (data.email && data.email !== updatedUser.email) {
        const existingEmail = await prisma.user.findUnique({ where: { email: data.email }});
        if (existingEmail) {
            throw new CustomError('This email is already in use.', 409);
        }
    }


  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

export async function updateUserById(userId: string, data: Partial<z.infer<typeof updateUserSchema>>) {
    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToUpdate) {
        throw new CustomError('User not found', 404);
    }
    
    if (data.email && data.email !== userToUpdate.email) {
        const existingEmail = await prisma.user.findUnique({ where: { email: data.email }});
        if (existingEmail) {
            throw new CustomError('This email is already in use.', 409);
        }
    }
    
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: data,
        include: {
            system: true 
        }
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
