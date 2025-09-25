import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input data',
            errors: err.flatten().fieldErrors,
        });
    }

    return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred',
    });
}
