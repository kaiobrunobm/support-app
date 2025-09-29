import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { authenticate, authorizeUser, authorizeAdminOrIT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', [authenticate, authorizeUser], ticketController.createTicket);
router.get('/me/active', [authenticate, authorizeUser], ticketController.getMyActiveTicket);

router.get('/', [authenticate, authorizeAdminOrIT], ticketController.getTickets);

router.get('/:id', authenticate, ticketController.getTicketById);

router.post('/:id/messages', authenticate, ticketController.addMessage);

router.patch('/:id/status', [authenticate, authorizeAdminOrIT], ticketController.updateTicketStatus);

export default router;
