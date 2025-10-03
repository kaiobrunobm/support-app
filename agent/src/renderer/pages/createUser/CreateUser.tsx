import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as apiService from '../../api/apiService';
import { AppUser, SystemInfo } from '../../types';

import Input from '../../components/Input';
import Button from '../../components/Button';
import { CircleNotchIcon, UserPlusIcon, CaretLeftIcon } from '@phosphor-icons/react';
import ConfirmationModal from '../../components/ConfirmationModal';
import Dropdown from '../../components/Dropdown';
import MaskedInput from '../../components/MaskedInput';
import { useAppContext } from '../../context/ContextProvider';
import ImageUploadInput from '../../components/ImageUploadInput';

const sectorOptions = [
  { value: 'Tesouraria', label: 'Tesouraria' },
  { value: 'Tributos', label: 'Tributos' },
  { value: 'Compras', label: 'Compras' },
  { value: 'RH', label: 'RH' },
  { value: 'TI', label: 'TI' },
  { value: 'Licitação', label: 'Licitação' },
  { value: 'Controladoria', label: 'Controladoria' },
];

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, hostname } = location.state as { systemId: string, hostname: string };
  const { setSystemInfo, updateSystemInList, updateUserForSystem } = useAppContext();


  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    sector: '',
    role: 'USER' as 'USER' | 'IT_SUPPORT',
    avatarUrl: '',
    systemId: systemId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [reassignmentData, setReassignmentData] = useState<{ user: AppUser, oldSystem: SystemInfo, newSystem: SystemInfo } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadComplete = (newAvatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.createUser(formData);

      if (response.data.status === 'reassignment_required') {
        setReassignmentData(response.data.data);
        setModalOpen(true);
      } else if (response.data.status === 'success') {
        const newUser = response.data.data.user;
        toast.success(`Usuário ${response.data.data.user.fullname} criado e atribuído com sucesso!`);

        updateUserForSystem(systemId, newUser);
        setSystemInfo(prev => prev ? { ...prev, user: newUser } : null);

        navigate(-1);
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
      const response = await apiService.forceReassignUser(reassignmentData.user.id, reassignmentData.newSystem.id);

      const updatedUser = response.data.data.user;

      toast.success(`Usuário ${reassignmentData.user.fullname} reatribuído para ${reassignmentData.newSystem.hostname} com sucesso!`);
      updateUserForSystem(reassignmentData.oldSystem.id, null);
      updateUserForSystem(reassignmentData.newSystem.id, updatedUser);
      setSystemInfo(prev => prev && prev.id === reassignmentData.newSystem.id ? { ...prev, user: updatedUser } : prev);

      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao reatribuir usuário.');
    } finally {
      setIsLoading(false);
      setReassignmentData(null);
    }
  };

  const handleSectorSelect = (option: { value: string; label: string }) => {
    setFormData({ ...formData, sector: option.value });
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <button onClick={() => navigate(-1)} className="rounded-full py-3 px-3 hover:bg-border/40">
          <CaretLeftIcon size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Adicionar Usuário</h1>
          <p className="text-secondaryText flex items-center gap-3">Atribuindo um novo usuário ao sistema: <span className="font-bold text-text">{hostname}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploadInput onUploadComplete={handleUploadComplete} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="firstname" placeholder="Nome" value={formData.firstname} onChange={handleChange} error={errors.firstname?.[0]} />
          <Input name="lastname" placeholder="Sobrenome" value={formData.lastname} onChange={handleChange} error={errors.lastname?.[0]} />
        </div>
        <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} error={errors.email?.[0]} />
        <Input name="password" type="password" placeholder="Senha" value={formData.password} onChange={handleChange} error={errors.password?.[0]} />
        <div className='w-1/2'>
          <MaskedInput
            name="phone"
            placeholder="Telefone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone?.[0]}
            mask="(00) 00000-0000"
          />
        </div>
        <div className='flex gap-4'>
          <Dropdown
            label="Setor"
            options={sectorOptions}
            selected={sectorOptions.find(o => o.value === formData.sector) || null}
            onSelect={handleSectorSelect}
            error={errors.sector?.[0]}
          />
          <Dropdown label="Função" options={[{ value: 'USER', label: 'Usuário' }, { value: 'IT_SUPPORT', label: 'Técnico' }]} selected={formData.role === 'IT_SUPPORT' ? { value: 'IT_SUPPORT', label: 'Técnico' } : { value: 'USER', label: 'Usuário' }} onSelect={(option) => setFormData({ ...formData, role: option.value as 'USER' | 'IT_SUPPORT' })} error={errors.role?.[0]} />
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
          title="Confirmar Reatribuição"
          message={
            <p>
              O usuário <strong className="text-text">{reassignmentData.user.fullname}</strong> já está atribuído ao sistema <strong className="text-text">{reassignmentData.oldSystem.hostname}</strong>.
              Deseja reatribuí-lo para <strong className="text-text">{reassignmentData.newSystem.hostname}</strong>?
            </p>
          }
          confirmText="Sim, Reatribuir"
          variant="primary"
        />
      )}
    </div>
  );
};

export default CreateUserPage;
