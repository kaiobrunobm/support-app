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
  const isSentByMe = message.senderId === currentUserId;

  return (
    <div className={`flex items-end gap-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
      
      {!isSentByMe && (
        <div className="flex-shrink-0">
          <Avatar {...message.sender} />
        </div>
      )}
      
      <div className={`flex flex-col rounded-lg px-4 py-2 ${isSentByMe ? 'bg-primary text-primary-foreground text-start' : 'bg-muted text-end'}`}>
         <p className={`mb-1 text-xs font-bold text-secondaryText ${isSentByMe ? 'text-right' : 'text-left'}`}>
          {isSentByMe ? 'You' : message.sender.fullname}
        </p>
        
        
         <div 
          className={`w-fit max-w-lg py-2 ${isSentByMe 
            ? 'rounded-l-lg rounded-tr-lg' 
            : 'rounded-r-lg rounded-tl-lg'
          }`}
        >
          {message.imageUrl && <img src={message.imageUrl} alt="Anexo" className="mb-2 max-w-xs rounded-md" />}
          {message.content && <p className={`px-4 py-2  ${!isSentByMe ? 'bg-border rounded-r-lg rounded-t-lg' : 'bg-[#278EFF] rounded-l-lg rounded-t-lg'}`}>{message.content}</p>
}
        </div>
        <span className={`mt-1 text-xs text-text/60 ${isSentByMe ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.createdAt), 'HH:mm ', { locale: ptBR })}
        </span>
      </div>
      {isSentByMe && (
        <div className="flex-shrink-0">
          <Avatar {...message.sender} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
