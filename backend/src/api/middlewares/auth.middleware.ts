import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';
import { AuthRequest } from '../../types/AuthRequest'; 

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized: No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: User not found.' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token.' });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: You do not have permission to perform this action.'
        });
    }
    next();
};

export const authorizeAdminOrIT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'IT_SUPPORT') {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: You do not have permission to perform this action.'
        });
    }
    next();
};

export const authorizeUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'USER') {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: This action is only available to standard users.'
        });
    }
    next();
};
