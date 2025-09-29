import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as apiService from '../api/apiService';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { CircleNotchIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string[], initialMessage?: string[] }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.createTicket({ subject, initialMessage });
      if (response.data.status === 'success') {
        const newTicket = response.data.data.ticket;
        toast.success('Chamado criado com sucesso!');
        onClose(); // Close the modal
        navigate(`/app/tickets/${newTicket.id}`); // Navigate to the chat page
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error('Por favor, preencha os campos corretamente.');
      } else {
        toast.error(err.response?.data?.message || 'Ocorreu um erro ao criar o chamado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir um Novo Chamado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-secondaryText mb-1">
            Assunto
          </label>
          <Input
            id="subject"
            name="subject"
            placeholder="Ex: Minha impressora não funciona"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject?.[0]}
          />
        </div>
        <div>
          <label htmlFor="initialMessage" className="block text-sm font-medium text-secondaryText mb-1">
            Descreva o problema
          </label>
          <textarea
            id="initialMessage"
            name="initialMessage"
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            placeholder="Por favor, forneça o máximo de detalhes possível sobre o problema que você está enfrentando."
            className={`w-full min-h-[120px] resize-y rounded-lg border-2 p-3 outline-none bg-background ${errors.initialMessage ? 'border-error' : 'border-border'}`}
          />
          {errors.initialMessage && <p className="text-sm text-error mt-1">{errors.initialMessage[0]}</p>}
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading} iconLeft={isLoading ? <CircleNotchIcon className="animate-spin" /> : <PaperPlaneTiltIcon />}>
            {isLoading ? 'Enviando...' : 'Enviar Chamado'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTicketModal;
