import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as apiService from '../../api/apiService';
import { AppUser, SystemInfo } from '../../types';

import Input from '../../components/Input';
import Button from '../../components/Button';
import { CircleNotchIcon, ArrowLeftIcon, UserPlusIcon } from '@phosphor-icons/react';
import ConfirmationModal from '../../components/ConfirmationModal';

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the systemId from the navigation state passed by the Dashboard
  const { systemId, hostname } = location.state as { systemId: string, hostname: string };

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    sector: '',
    role: 'USER' as 'USER' | 'IT_SUPPORT',
    systemId: systemId, // Pre-fill the systemId
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  // State for the reassignment confirmation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [reassignmentData, setReassignmentData] = useState<{ user: AppUser, oldSystem: SystemInfo, newSystem: SystemInfo } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.createUser(formData);
      
      if (response.data.status === 'reassignment_required') {
        // API detected a conflict, show the confirmation modal
        setReassignmentData(response.data.data);
        setModalOpen(true);
      } else if (response.data.status === 'success') {
        // User was created successfully
        toast.success(`Usuário ${response.data.data.user.fullname} criado e atribuído com sucesso!`);
        navigate('/app/dashboard'); // Navigate back to the dashboard
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error('Por favor, corrija os erros no formulário.');
      } else {
        toast.error(err.response?.data?.message || 'Ocorreu um erro ao criar o usuário.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReassignment = async () => {
    if (!reassignmentData) return;
    setIsLoading(true);
    setModalOpen(false);
    
    try {
      await apiService.forceReassignUser(reassignmentData.user.id, reassignmentData.newSystem.id);
      toast.success(`Usuário ${reassignmentData.user.fullname} reatribuído para ${reassignmentData.newSystem.hostname} com sucesso!`);
      navigate('/app/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao reatribuir usuário.');
    } finally {
      setIsLoading(false);
      setReassignmentData(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted/50">
          <ArrowLeftIcon size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-bold">Adicionar Usuário</h1>
            <p className="text-secondaryText">Atribuindo um novo usuário ao sistema: <span className="font-bold text-text">{hostname}</span></p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="firstname" placeholder="Nome" value={formData.firstname} onChange={handleChange} error={errors.firstname?.[0]} />
          <Input name="lastname" placeholder="Sobrenome" value={formData.lastname} onChange={handleChange} error={errors.lastname?.[0]} />
        </div>
        <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} error={errors.email?.[0]} />
        <Input name="password" type="password" placeholder="Senha" value={formData.password} onChange={handleChange} error={errors.password?.[0]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} error={errors.phone?.[0]} />
          <Input name="sector" placeholder="Setor" value={formData.sector} onChange={handleChange} error={errors.sector?.[0]} />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-secondaryText mb-1">Função</label>
          <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background outline-none text-text">
            <option value="USER">Usuário Padrão</option>
            <option value="IT_SUPPORT">Suporte de TI</option>
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} iconLeft={isLoading ? <CircleNotchIcon className="animate-spin" /> : <UserPlusIcon />}>
            {isLoading ? 'Criando...' : 'Criar e Atribuir Usuário'}
          </Button>
        </div>
      </form>

      {reassignmentData && (
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmReassignment}
          user={reassignmentData.user}
          oldSystem={reassignmentData.oldSystem}
          newSystem={reassignmentData.newSystem}
        />
      )}
    </div>
  );
};

export default CreateUserPage;
