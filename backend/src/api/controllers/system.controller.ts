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

// Add your other controller functions here for search, getById, etc.
