import React, { useState } from 'react';
import { toast } from 'sonner';
import { PaperPlaneTiltIcon, PaperclipIcon, CircleNotchIcon } from '@phosphor-icons/react';
import * as apiService from '../api/apiService';
import Button from './Button';

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
      setContent(''); // Clear input on success
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

      // Send a message with the image URL and any existing text content
      await apiService.addMessage(ticketId, { content: content || 'Anexo', imageUrl });
      setContent(''); // Clear input
    } catch (err) {
      toast.error('Falha ao fazer upload da imagem.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-border p-4">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
        <PaperclipIcon size={20} />
      </Button>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Digite sua mensagem..."
        className="flex-1 resize-none rounded-lg border-2 border-border bg-background p-2 outline-none"
        rows={1}
        disabled={isSending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      <Button onClick={handleSendMessage} disabled={isSending}>
        {isSending ? <CircleNotchIcon className="animate-spin" /> : <PaperPlaneTiltIcon size={20} />}
      </Button>
    </div>
  );
};

export default MessageInput;
