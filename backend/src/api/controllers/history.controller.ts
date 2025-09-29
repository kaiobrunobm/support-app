import { Request, Response, NextFunction } from 'express';
import * as HistoryService from '../../services/history.service';

export async function getSystemHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const history = await HistoryService.getSystemHistory(id);
    res.status(200).json({ status: 'success', data: { history } });
  } catch (error) {
    next(error);
  }
}

export async function getTicketHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const history = await HistoryService.getTicketHistory(id);
    res.status(200).json({ status: 'success', data: { history } });
  } catch (error) {
    next(error);
  }
}
