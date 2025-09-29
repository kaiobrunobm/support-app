"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
const error_middleware_1 = require("../middlewares/error.middleware");
function uploadImage(req, res, next) {
    try {
        if (!req.file) {
            throw new error_middleware_1.CustomError('No image file provided.', 400);
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(201).json({
            status: 'success',
            message: 'File uploaded successfully',
            data: {
                url: fileUrl
            }
        });
    }
    catch (error) {
        next(error);
    }
}
