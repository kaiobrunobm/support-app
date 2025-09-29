import { Request, Response, NextFunction } from 'express';
import * as DashboardService from '../../services/dashboard.service';


export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await DashboardService.getDashboardStats();

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
}
