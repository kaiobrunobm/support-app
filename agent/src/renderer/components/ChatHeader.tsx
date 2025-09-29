import React from 'react';
import { toast } from 'sonner';
import { Ticket } from '../types';
import * as apiService from '../api/apiService';
import { useAppContext } from '../context/ContextProvider'
import Button from './Button';
import { CaretLeftIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router';

interface ChatHeaderProps {
  ticket: Ticket;
  setTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ ticket, setTicket }) => {
  const { user } = useAppContext();
  const navigation = useNavigate();

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
    <div className="sticky top-0 w-full bg-background flex items-center justify-between border-b border-border p-4">
      <div className='flex gap-6'>
        <button onClick={() => navigation(-1)} className="rounded-full py-2 px-3 hover:bg-border/40">
          <CaretLeftIcon size={24} />
        </button>
        <div>
        {ticket.assignee ? (
          <h2 className="text-lg font-bold">{ticket.requester.fullname} ({ticket.requester.sector})</h2>
        ) :
          <div className="text-lg font-bold">{ticket.assignee ? <h2>{ticket.assignee.fullname} ({ticket.assignee.sector})</h2> : <h2>Esperando técnico...</h2>}</div>

        }
        <p className="text-sm text-secondaryText">
          Assunto: {ticket.subject}
        </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
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
