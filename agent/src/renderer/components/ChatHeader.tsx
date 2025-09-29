import React from 'react';
import { toast } from 'sonner';
import { Ticket } from '../types';
import * as apiService from '../api/apiService';
import { useAppContext } from '../context/ContextProvider'
import Button from './Button';

interface ChatHeaderProps {
  ticket: Ticket;
  setTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
}

const statusStyles = {
  OPEN: 'bg-orange-500/20 text-orange-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ ticket, setTicket }) => {
  const { user } = useAppContext();
  const isITSupport = user?.role === 'IT_SUPPORT' || user?.role === 'ADMIN';

  const handleStatusUpdate = async (status: 'RESOLVED' | 'PENDING') => {
    try {
      const response = await apiService.updateTicketStatus(ticket.id, { status });
      if (response.data.status === 'success') {
        setTicket(response.data.data.ticket);
        toast.success(`Chamado marcado como ${status === 'RESOLVED' ? 'resolvido' : 'pendente'}.`);
      }
    } catch (err) {
      toast.error('Falha ao atualizar o status do chamado.');
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-border p-4">
      <div>
        <h2 className="text-lg font-bold">{ticket.subject}</h2>
        <p className="text-sm text-secondaryText">
          Solicitado por {ticket.requester.fullname}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status]}`}>
          {ticket.status}
        </span>
        {isITSupport && ticket.status !== 'RESOLVED' && (
          <Button onClick={() => handleStatusUpdate('RESOLVED')}>Resolver Chamado</Button>
        )}
        {isITSupport && ticket.status === 'RESOLVED' && (
          <Button variant="secondary" onClick={() => handleStatusUpdate('PENDING')}>Reabrir Chamado</Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
