import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as apiService from '../../api/apiService';
import { AppUser } from '../../types';
import { useAppContext } from '../../context/ContextProvider';

import Input from '../../components/Input';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import MaskedInput from '../../components/MaskedInput';
import ImageUploadInput from '../../components/ImageUploadInput';
import { CircleNotchIcon, ArrowLeftIcon, FloppyDiskIcon } from '@phosphor-icons/react';

const roleOptions = [
  { value: 'USER', label: 'Usuário Padrão' },
  { value: 'IT_SUPPORT', label: 'Suporte de TI' },
  { value: 'ADMIN', label: 'Administrador' },
];

const sectorOptions = [
  { value: 'Tesouraria', label: 'Tesouraria' },
  { value: 'Tributos', label: 'Tributos' },
  { value: 'Compras', label: 'Compras' },
  { value: 'RH', label: 'RH' },
  { value: 'TI', label: 'TI' },
  { value: 'Licitação', label: 'Licitação' },
  { value: 'Controladoria', label: 'Controladoria' },
];

const EditUserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: loggedInUser, setUser, updateUserForSystem   } = useAppContext();

  const [userToEdit, setUserToEdit] = useState<AppUser | null>(null);
  
  const [formData, setFormData] = useState<Partial<AppUser>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  

  const isAdmin = loggedInUser?.role === 'ADMIN';
  const isEditingSelf = loggedInUser?.id === userId;

    const handleSectorSelect = (option: { value: string; label: string }) => {
    setFormData({ ...formData, sector: option.value });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = isEditingSelf ? await apiService.getMe() : await apiService.getUserById(userId);
        const fetchedUser = response.data.data.user;
        setUserToEdit(fetchedUser);
        setFormData(fetchedUser);

      } catch (err) {
        toast.error('Falha ao carregar dados do usuário.');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId, isEditingSelf]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRoleSelect = (option: { value: string; label: string }) => {
    setFormData({ ...formData, role: option.value as 'USER' | 'IT_SUPPORT' | 'ADMIN' });
  };

  const handleUploadComplete = (newAvatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const apiCall = isEditingSelf 
        ? apiService.updateMe(formData)
        : apiService.updateUserById(userId!, formData);
        
      await apiCall;

      const response = await apiCall;
      const updatedUser = response.data.data.user;

      toast.success('Perfil atualizado com sucesso!');

      if (isEditingSelf) {
        setUser(updatedUser);
      }

       if (updatedUser.system?.id) {
          updateUserForSystem(updatedUser.system.id, updatedUser);
      }
      

      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircleNotchIcon size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
       <div className="flex items-center gap-6 mb-6">
        <button onClick={() => navigate(-1)} className="p-3 rounded-full hover:bg-border/40">
          <ArrowLeftIcon size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Editar Perfil</h1>
          <p className="text-secondaryText">Modificando o perfil de <span className="font-bold text-text">{userToEdit?.fullname}</span></p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploadInput 
          initialAvatarUrl={formData.avatarUrl} 
          onUploadComplete={handleUploadComplete} 
        />
        
        <Input name="fullname" placeholder="Nome Completo" value={formData.fullname || ''} onChange={handleChange} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} />
          <MaskedInput name="phone" placeholder="Telefone" value={formData.phone || ''} onChange={handleChange} mask="(00) 00000-0000" />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Setor"
            options={sectorOptions}
            selected={sectorOptions.find(o => o.value === formData.sector) || null}
            onSelect={handleSectorSelect}
            error={errors.sector?.[0]}
          />
        </div>
        
        {isAdmin && !isEditingSelf && (
          <Dropdown
            label="Função"
            options={roleOptions}
            selected={roleOptions.find(o => o.value === formData.role) || null}
            onSelect={handleRoleSelect}
          />
        )}
        
        {isEditingSelf && (
          <div className="border-t border-border pt-6">
              <Button type="button" variant="secondary">Alterar Senha</Button>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} iconLeft={isSaving ? <CircleNotchIcon className="animate-spin" /> : <FloppyDiskIcon />}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;

