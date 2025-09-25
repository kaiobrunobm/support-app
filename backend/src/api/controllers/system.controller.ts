import { Request, Response, NextFunction } from 'express';
import * as SystemService from '../../services/systeminfo.service';
import { systemInfoPayloadSchema } from '../../utils/systemInfoSchema';

export async function upsertSystem(req: Request, res: Response, next: NextFunction) {
    try {
     
        const validatedData = systemInfoPayloadSchema.parse(req.body);

       
        const result = await SystemService.upsertSystemInfo(validatedData);

       
        res.status(201).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Search query parameter "q" is required.' });
    }
    
    const systems = await SystemService.searchSystems(query);
    
    res.status(200).json(systems);
  } catch (error) {
    next(error);
  }
};

export const getSystemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const system = await SystemService.findSystemById(id);

    if (!system) {
      return res.status(404).json({ error: 'System not found' });
    }
    res.status(200).json(system);
  } catch (error) {
    next(error);
  }
};

// Add your other controller functions here for search, getById, etc.
