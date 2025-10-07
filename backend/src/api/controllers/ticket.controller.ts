import { Response, NextFunction } from 'express';
import * as TicketService from '../../services/ticket.service';
import { createTicketSchema, createMessageSchema, updateTicketStatusSchema } from '../../utils/systemInfoSchema';
import { AuthRequest } from '../../types/AuthRequest';
import { TicketStatus } from '@prisma/client';

export async function createTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { subject, initialMessage } = createTicketSchema.parse(req.body);
    const requesterId = req.user!.id;
    const io = req.app.get('io');

    const newTicket = await TicketService.createTicket(subject, initialMessage, requesterId, io);

    res.status(201).json({ status: 'success', data: { ticket: newTicket } });
  } catch (error) {
    next(error);
  }
}

export async function getTickets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as TicketStatus | undefined;
    if (!status || !['OPEN', 'PENDING', 'RESOLVED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'A valid status query parameter is required (OPEN, PENDING, RESOLVED, CANCELLED).' });
    }

    const userId = req.user!.id;
    const userRole = req.user!.role;

    const tickets = await TicketService.getTicketsByStatus(status, userId, userRole);

    res.status(200).json({ status: 'success', data: { tickets } });
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const ticket = await TicketService.getTicketDetails(id, userId, userRole);
    res.status(200).json({ status: 'success', data: { ticket } });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = updateTicketStatusSchema.parse(req.body);
    const itSupportUserId = req.user!.id;
    const io = req.app.get('io');

    const updatedTicket = await TicketService.updateTicketStatus(id, status, itSupportUserId, io);
    res.status(200).json({ status: 'success', data: { ticket: updatedTicket } });
  } catch (error) {
    next(error);
  }
}

export async function addMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id: ticketId } = req.params;
    const { content, imageUrl } = createMessageSchema.parse(req.body);
    const senderId = req.user!.id;


    const io = req.app.get('io');

    const newMessage = await TicketService.addMessageToTicket(ticketId, senderId, content, imageUrl, io);


    res.status(201).json({ status: 'success', data: { message: newMessage } });
  } catch (error) {
    next(error);
  }
}

export async function getMyActiveTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const requesterId = req.user!.id;
    const activeTicket = await TicketService.findActiveTicketForUser(requesterId);

    if (!activeTicket) {
      return res.status(404).json({ status: 'not_found', message: 'No active ticket found for this user.' });
    }

    res.status(200).json({ status: 'success', data: { ticket: activeTicket } });
  } catch (error) {
    next(error);
  }
}
