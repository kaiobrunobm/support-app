import { ChatIcon } from '@phosphor-icons/react';
import React from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

interface ChatToastProps {
  id: string | number;
  title: string;
  body: string;
  ticketId: string;
}

const ChatToast: React.FC<ChatToastProps> = ({ id, title, body, ticketId }) => {

  const navigate = useNavigate();


  return (
    <div
      className="flex items-start w-80 max-w-sm gap-4 p-4 rounded-lg shadow-lg bg-background border border-border text-text cursor-pointer"
      onClick={() => {
         toast.dismiss(id)
          navigate(`/app/tickets/${ticketId}`);
      }}
    >
      <div className="flex-shrink-0 mt-1">
        <ChatIcon size={24} className="text-text" />
      </div>
      <div className="flex-grow">
        <p className="font-bold">{title}</p>
        <p className="text-sm text-secondaryText">{body}</p>
      </div>
    </div>
  );
};

export default ChatToast;

