import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CircleNotchIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { useAppContext } from '../../context/ContextProvider';
import * as apiService from '../../api/apiService';
import { Ticket, Message } from '../../types';

import ChatHeader from '../../components/ChatHeader';
import ChatMessage from '../../components/ChatMessage';
import MessageInput from '../../components/MessageInput';

const TicketChatPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user, socket } = useAppContext();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Effect for fetching initial data and joining the socket room
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
          // After fetching, join the socket room for this ticket
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

  // Effect for listening to real-time socket events
  useEffect(() => {
    if (!socket) return;

    // Listener for new messages
    const handleReceiveMessage = (newMessage: Message) => {
      setTicket((currentTicket) => {
        if (!currentTicket || currentTicket.messages.some(m => m.id === newMessage.id)) {
          return currentTicket; // Avoid duplicate messages
        }
        return { ...currentTicket, messages: [...currentTicket.messages, newMessage] };
      });
    };

    // Listener for ticket status updates
    const handleTicketStatusUpdate = (updatedTicket: Ticket) => {
      setTicket(updatedTicket);
      toast.info(`Status do chamado atualizado para: ${updatedTicket.status}`);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('ticketStatusUpdated', handleTicketStatusUpdate);

    // Cleanup listeners when the component unmounts or socket changes
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('ticketStatusUpdated', handleTicketStatusUpdate);
    };
  }, [socket]);

  // Effect to scroll to the latest message
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
    <div className="flex h-[calc(100vh-120px)] w-full flex-col rounded-lg borderbg-card">
      <button onClick={() => navigate(-1)} className="p-2 absolute top-20 left-4 rounded-full hover:bg-muted/50">
        <ArrowLeftIcon size={24} />
      </button>
      <ChatHeader ticket={ticket} setTicket={setTicket} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {ticket?.messages.map((message) => (
          <ChatMessage key={message.id} message={message} currentUserId={user!.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput ticketId={ticket.id} />
    </div>
  );
};

export default TicketChatPage;
