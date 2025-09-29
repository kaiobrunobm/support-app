"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../api/middlewares/error.middleware");
async function loginUser(email, password) {
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: {
            system: {
                include: {
                    user: true,
                    computerUsers: true,
                    hardware: { include: { cpu: true, memory: true } },
                    network: { include: { adapters: true } },
                    disks: true,
                    printers: true,
                }
            }
        }
    });
    if (!user) {
        throw new error_middleware_1.CustomError('Invalid credentials', 401);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.CustomError('Invalid credentials', 401);
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, fullname: user.fullname }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { loginDate: new Date() },
    });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
}
