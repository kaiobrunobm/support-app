import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as apiService from '../../api/apiService';
import { AppUser, SystemInfo } from '../../types';
import { useAppContext } from '../../context/ContextProvider';

import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import { CircleNotchIcon, ArrowLeftIcon, UserSwitchIcon } from '@phosphor-icons/react';
import ConfirmationModal from '../../components/ConfirmationModal';

const AssignUserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, hostname } = location.state as { systemId: string, hostname: string };
  const { updateUserForSystem, setSystemInfo } = useAppContext();

  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [reassignmentData, setReassignmentData] = useState<{ user: AppUser, oldSystem: SystemInfo, newSystem: SystemInfo } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.getAllUsers();
        setAllUsers(response.data.data.users);
      } catch (err) {
        toast.error('Falha ao carregar lista de usuários.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error('Por favor, selecione um usuário.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await apiService.assignExistingUser(selectedUser.id, systemId);
      if (response.data.status === 'reassignment_required') {
        setReassignmentData(response.data.data);
        setModalOpen(true);
      } else {
        toast.success(`Usuário ${selectedUser.fullname} atribuído com sucesso!`);
        updateUserForSystem(systemId, selectedUser);
        setSystemInfo(prev => prev ? { ...prev, user: selectedUser } : null);
        navigate(-1);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao atribuir usuário.');
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

  const userOptions = allUsers.map(u => ({
    value: u.id,
    label: `${u.fullname} ${u.system ? `(${u.system.hostname})` : '(Sem sistema)'}`,
  }));

  return (
    <main className='text-text'>


      <header className="h-full sticky top-0 py-3 px-4 flex items-center gap-6 bg-background/50 backdrop-blur-lg z-30 text-text w-full border-b border-border">
         <button onClick={() => navigate(-1)} className="p-3 rounded-full hover:bg-border/40">
           <ArrowLeftIcon size={24} />
         </button>
        <div>
          <h1 className="text-3xl font-bold">Atribuir Usuário Existente</h1>
          <p className="text-secondaryText">Atribuindo um usuário ao sistema: <span className="font-bold text-text">{hostname}</span></p>
        </div>
      </header>
      
    <div className="w-full max-w-xl mx-auto py-12">
      <div className="space-y-6">
        <Dropdown
          label="Selecione um Usuário"
          options={userOptions}
          selected={selectedUser ? { value: selectedUser.id, label: `${selectedUser.fullname} ${selectedUser.system ? `(${selectedUser.system.hostname})` : '(Sem sistema)'}` } : null}
          onSelect={(option) => setSelectedUser(allUsers.find(u => u.id === option.value) || null)}
        />
        <div className="flex justify-end pt-4">
          <Button onClick={handleAssign} disabled={isLoading || !selectedUser} iconLeft={isLoading ? <CircleNotchIcon className="animate-spin" /> : <UserSwitchIcon />}>
            {isLoading ? 'Atribuindo...' : 'Atribuir Usuário'}
          </Button>
        </div>
      </div>

      {reassignmentData && (
        <ConfirmationModal message={
          <p>
            O usuário <strong className="text-text">{selectedUser?.fullname}</strong> já está ocupando o <strong className="text-text">{selectedUser?.system.hostname}</strong>.
            Deseja desvincular o usuário atual e ?
          </p>
        } title="Reatribuição de Usuário" isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmReassignment} />
      )}
    </div>
    </main>

  );
};

export default AssignUserPage;
