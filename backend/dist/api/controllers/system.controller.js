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
exports.updateSystem = exports.getAllSystems = exports.getSystemById = exports.search = void 0;
exports.upsertSystem = upsertSystem;
const SystemService = __importStar(require("../../services/systeminfo.service"));
const schemas = __importStar(require("../../utils/systemInfoSchema"));
async function upsertSystem(req, res, next) {
    try {
        const validatedData = schemas.systemInfoPayloadSchema.parse(req.body);
        const result = await SystemService.upsertSystemInfo(validatedData);
        res.status(201).json({
            status: 'success',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
const search = async (req, res, next) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ status: 'error', message: 'Search query parameter "q" is required.' });
        }
        const systems = await SystemService.searchSystems(query);
        res.status(200).json(systems);
    }
    catch (error) {
        next(error);
    }
};
exports.search = search;
const getSystemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const system = await SystemService.findSystemById(id);
        if (!system) {
            return res.status(404).json({ error: 'System not found' });
        }
        res.status(200).json(system);
    }
    catch (error) {
        next(error);
    }
};
exports.getSystemById = getSystemById;
const getAllSystems = async (req, res, next) => {
    try {
        const systems = await SystemService.getAllSystems();
        res.status(200).json({
            status: 'success',
            results: systems.length,
            data: { systems },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllSystems = getAllSystems;
const updateSystem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = schemas.updateSystemInfoSchema.parse(req.body);
        const updatedSystem = await SystemService.updateSystemDetails(id, validatedData);
        res.status(200).json({
            status: 'success',
            data: { system: updatedSystem },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSystem = updateSystem;
