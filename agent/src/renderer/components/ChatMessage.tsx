import React from 'react';
import { Message } from '../types';
import Avatar from './Avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId }) => {
  const isSentByMe = message.sender.id === currentUserId;

  return (
    <div className={`flex items-end gap-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
      {!isSentByMe && (
        <div className="flex-shrink-0">
          <Avatar {...message.sender} />
        </div>
      )}
      <div className={`flex max-w-lg flex-col rounded-lg px-4 py-2 ${isSentByMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {!isSentByMe && (
            <p className="text-xs font-bold text-primary mb-1">{message.sender.fullname}</p>
        )}
        {message.imageUrl && <img src={message.imageUrl} alt="Anexo" className="mb-2 max-w-xs rounded-md" />}
        <p className="text-sm">{message.content}</p>
        <span className={`mt-1 text-xs opacity-60 ${isSentByMe ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
