"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.reassignUser = reassignUser;
exports.detachUser = detachUser;
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.changePassword = changePassword;
const UserService = __importStar(require("../../services/user.service"));
const systemInfoSchema_1 = require("../../utils/systemInfoSchema");
async function createUser(req, res, next) {
    try {
        const validatedData = systemInfoSchema_1.createUserSchema.parse(req.body);
        const result = await UserService.createAndAssignUser(validatedData);
        if (result.reassignmentRequired) {
            return res.status(200).json({
                status: 'reassignment_required',
                data: result,
            });
        }
        res.status(201).json({
            status: 'success',
            data: { user: result.user },
        });
    }
    catch (error) {
        next(error);
    }
}
async function reassignUser(req, res, next) {
    try {
        const { userId, newSystemId } = req.body;
        const updatedUser = await UserService.forceReassignUser(userId, newSystemId);
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    }
    catch (error) {
        next(error);
    }
}
async function detachUser(req, res, next) {
    try {
        const { systemId } = req.params;
        await UserService.detachUserFromSystem(systemId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        const userId = req.user.id;
        const userProfile = await UserService.getUserProfile(userId);
        res.status(200).json({ status: 'success', data: { user: userProfile } });
    }
    catch (error) {
        next(error);
    }
}
async function updateMe(req, res, next) {
    try {
        const userId = req.user.id;
        const validatedData = systemInfoSchema_1.updateUserProfileSchema.parse(req.body);
        const updatedUser = await UserService.updateUserProfile(userId, validatedData);
        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    }
    catch (error) {
        next(error);
    }
}
async function changePassword(req, res, next) {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = systemInfoSchema_1.changePasswordSchema.parse(req.body);
        const result = await UserService.changeUserPassword(userId, currentPassword, newPassword);
        res.status(200).json({ status: 'success', data: result });
    }
    catch (error) {
        next(error);
    }
}
