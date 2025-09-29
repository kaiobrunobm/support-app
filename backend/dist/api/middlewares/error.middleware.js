"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.CustomError = CustomError;
function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }
    if (err instanceof zod_1.ZodError) {
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
