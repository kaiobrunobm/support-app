import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { CircleNotchIcon, PlusIcon } from '@phosphor-icons/react';
import { useAppContext } from '../../context/ContextProvider';
import * as apiService from '../../api/apiService';
import { isSameDay, isToday, isYesterday, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, Message } from '../../types';

import ChatHeader from '../../components/ChatHeader';
import ChatMessage from '../../components/ChatMessage';
import MessageInput from '../../components/MessageInput';

const formatDateSeparator = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) {
    return 'Hoje';
  }
  if (isYesterday(date)) {
    return 'Ontem';
  }
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
};

const TicketChatPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user, socket } = useAppContext();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!ticketId) {
      setError('Ticket ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchTicketDetails = async () => {
      try {
        const response = await apiService.getTicketById(ticketId);
        if (response.data.status === 'success') {
          setTicket(response.data.data.ticket);
          socket?.emit('joinTicketRoom', ticketId);
        } else {
          throw new Error('Failed to fetch ticket details.');
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os detalhes do chamado.');
        toast.error('Erro ao carregar o chamado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();

  }, [ticketId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: Message) => {
      setTicket((currentTicket) => {
        if (!currentTicket || currentTicket.messages.some(m => m.id === newMessage.id)) {
          return currentTicket;
        }
        return { ...currentTicket, messages: [...currentTicket.messages, newMessage] };
      });
    };

    const handleTicketStatusUpdate = (updatedTicket: Ticket) => {
      setTicket(updatedTicket);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('ticketStatusUpdated', handleTicketStatusUpdate);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('ticketStatusUpdated', handleTicketStatusUpdate);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircleNotchIcon size={40} weight="bold" className="animate-spin text-text" />
      </div>
    );
  }

  if (error || !ticket) {
    return <div className="text-error text-center">{error || 'Chamado não encontrado.'}</div>;
  }


  return (
    <div className="flex text-text w-full h-screen flex-col">
      <ChatHeader ticket={ticket} setTicket={setTicket} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {ticket.messages.map((message, index) => {
          const showDateSeparator = index === 0 || !isSameDay(
            parseISO(message.createdAt),
            parseISO(ticket.messages[index - 1].createdAt)
          );
          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-muted px-3 py-1 text-xs text-secondaryText rounded-full">
                    {formatDateSeparator(message.createdAt)}
                  </span>
                </div>
              )}
              <div className="mt-4 px-8">
                <ChatMessage message={message} currentUserId={user?.id} />
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {ticket.status !== 'RESOLVED' ? (
        <MessageInput ticketId={ticketId} />
      ) : (
        <span className={`w-full flex items-center justify-center text-secondaryText/60 ${user.role === 'IT_SUPPORT' && 'py-4'|| user.role === 'ADMIN' && 'py-4'}`}>Chamado resolvido</span>
      )}

      {ticket.status === 'RESOLVED' && user.role === 'USER' &&
        <span className='w-full flex items-center justify-center gap-2 cursor-pointer hover:underline py-4'>Criar um novo chamado <PlusIcon size={18} /></span>
      }
    </div>
  );
};

export default TicketChatPage;  
