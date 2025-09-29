"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeUser = exports.authorizeAdminOrIT = exports.authorizeAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../prisma"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: No token provided.'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: User not found.' });
        }
        req.user = { id: user.id, role: user.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token.' });
    }
};
exports.authenticate = authenticate;
const authorizeAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: You do not have permission to perform this action.'
        });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
const authorizeAdminOrIT = (req, res, next) => {
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'IT_SUPPORT') {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: You do not have permission to perform this action.'
        });
    }
    next();
};
exports.authorizeAdminOrIT = authorizeAdminOrIT;
const authorizeUser = (req, res, next) => {
    if (req.user?.role !== 'USER') {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: This action is only available to standard users.'
        });
    }
    next();
};
exports.authorizeUser = authorizeUser;
