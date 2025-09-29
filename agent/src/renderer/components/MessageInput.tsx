import React, { useState } from 'react';
import { toast } from 'sonner';
import { PaperclipIcon, CircleNotchIcon, PaperPlaneRightIcon } from '@phosphor-icons/react';
import * as apiService from '../api/apiService';
import Input from './Input';


interface MessageInputProps {
  ticketId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ ticketId }) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (content.trim() === '') return;
    setIsSending(true);

    try {
      await apiService.addMessage(ticketId, { content });
      setContent('');
    } catch (err) {
      toast.error('Falha ao enviar mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await apiService.uploadImage(formData);
      const imageUrl = uploadResponse.data.data.url;

     await apiService.addMessage(ticketId, { content: content, imageUrl });
      setContent('');
    } catch (err) {
      toast.error('Falha ao fazer upload da imagem.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-background flex items-center gap-2 border-t border-border p-4">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      <button onClick={() => fileInputRef.current?.click()} disabled={isSending} className='p-4 rounded-lg duration-150 transition-all ease-in hover:bg-border/40'>
        <PaperclipIcon size={24} />
      </button>
      <div className='w-full'>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

      </div>




      <button onClick={handleSendMessage} disabled={isSending} className='p-4 rounded-lg duration-150 transition-all ease-in hover:scale-150 active:scale-100'>
        {isSending ? <CircleNotchIcon className="animate-spin" /> : <PaperPlaneRightIcon size={24} weight='fill' />}
      </button>


    </div>
  );
};

export default MessageInput;
