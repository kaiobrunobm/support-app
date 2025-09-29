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
exports.createTicket = createTicket;
exports.getTickets = getTickets;
exports.getTicketById = getTicketById;
exports.updateTicketStatus = updateTicketStatus;
exports.addMessage = addMessage;
exports.getMyActiveTicket = getMyActiveTicket;
const TicketService = __importStar(require("../../services/ticket.service"));
const systemInfoSchema_1 = require("../../utils/systemInfoSchema");
async function createTicket(req, res, next) {
    try {
        const { subject, initialMessage } = systemInfoSchema_1.createTicketSchema.parse(req.body);
        const requesterId = req.user.id;
        const newTicket = await TicketService.createTicket(subject, initialMessage, requesterId);
        res.status(201).json({ status: 'success', data: { ticket: newTicket } });
    }
    catch (error) {
        next(error);
    }
}
async function getTickets(req, res, next) {
    try {
        const status = req.query.status;
        if (!status || !['OPEN', 'PENDING', 'RESOLVED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ status: 'error', message: 'A valid status query parameter is required (OPEN, PENDING, RESOLVED, CANCELLED).' });
        }
        const tickets = await TicketService.getTicketsByStatus(status);
        res.status(200).json({ status: 'success', data: { tickets } });
    }
    catch (error) {
        next(error);
    }
}
async function getTicketById(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const ticket = await TicketService.getTicketDetails(id, userId, userRole);
        res.status(200).json({ status: 'success', data: { ticket } });
    }
    catch (error) {
        next(error);
    }
}
async function updateTicketStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = systemInfoSchema_1.updateTicketStatusSchema.parse(req.body);
        const itSupportUserId = req.user.id;
        const io = req.app.get('io');
        const updatedTicket = await TicketService.updateTicketStatus(id, status, itSupportUserId, io);
        res.status(200).json({ status: 'success', data: { ticket: updatedTicket } });
    }
    catch (error) {
        next(error);
    }
}
async function addMessage(req, res, next) {
    try {
        const { id: ticketId } = req.params;
        const { content, imageUrl } = systemInfoSchema_1.createMessageSchema.parse(req.body);
        const senderId = req.user.id;
        if (!content && !imageUrl) {
            return res.status(400).json({ status: 'error', message: 'Message must have content or an image.' });
        }
        const io = req.app.get('io');
        //TODO imageURL type
        const newMessage = await TicketService.addMessageToTicket(ticketId, senderId, content ?? '', imageUrl, io);
        res.status(201).json({ status: 'success', data: { message: newMessage } });
    }
    catch (error) {
        next(error);
    }
}
async function getMyActiveTicket(req, res, next) {
    try {
        const requesterId = req.user.id;
        const activeTicket = await TicketService.findActiveTicketForUser(requesterId);
        if (!activeTicket) {
            // It's not an error to have no active ticket, so we return 404 Not Found
            return res.status(404).json({ status: 'not_found', message: 'No active ticket found for this user.' });
        }
        res.status(200).json({ status: 'success', data: { ticket: activeTicket } });
    }
    catch (error) {
        next(error);
    }
}
