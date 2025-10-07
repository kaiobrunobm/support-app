import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as apiService from '../../api/apiService';
import { AppUser, SystemInfo, SystemSummary } from '../../types';
import { useAppContext } from '../../context/ContextProvider';

import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import ConfirmationModal from '../../components/ConfirmationModal';
import { CircleNotchIcon, ArrowLeftIcon, UserSwitchIcon } from '@phosphor-icons/react';

const ReassignUserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, system: oldSystem } = location.state as { user: AppUser, system: SystemInfo | SystemSummary };
  const { updateUserForSystem, setSystemInfo } = useAppContext();

  const [allSystems, setAllSystems] = useState<SystemSummary[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<SystemSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await apiService.getAllSystems();
        setAllSystems(response.data.data.systems.filter((s: SystemSummary) => s.id !== oldSystem.id));
      } catch (err) {
        toast.error('Falha ao carregar lista de sistemas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSystems();
  }, [oldSystem.id]);

  const handleReassignClick = () => {
    if (!selectedSystem) return;

    if (selectedSystem.user && selectedSystem.user.id !== user.id) {
      setIsConflictModalOpen(true);
    } else {
      confirmAndExecuteReassignment();
    }
  };
  const confirmAndExecuteReassignment = async () => {
    if (!selectedSystem) return;

    setIsConflictModalOpen(false); 
    setIsLoading(true);
    try {      
      const response = await apiService.forceReassignUser(user.id, selectedSystem.id);
    
      const updatedUser = response.data.data.user;    
      
      toast.success(`Usuário ${updatedUser.fullname} reatribuído para ${selectedSystem.hostname} com sucesso!`);
      
      if (oldSystem.id) {
        updateUserForSystem(oldSystem.id, null);
      }
      updateUserForSystem(selectedSystem.id, updatedUser);
      
      setSystemInfo((prev: SystemInfo | null) => {
        if (!prev) return null;
        if (prev.id === oldSystem.id) return { ...prev, user: null }; // Update if viewing old system
        if (prev.id === selectedSystem.id) return { ...prev, user: updatedUser }; // Update if viewing new system
        return prev;
      });
      
      navigate('/app/systems');

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao reatribuir usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const systemOptions = allSystems.map(s => ({
    value: s.id,
    label: `${s.hostname} ${s.user ? `(Ocupado por ${s.user.fullname})` : '(Disponível)'}`,
  }));

  return (
    <main>
    <header className="h-full sticky top-0 py-3 px-4 flex items-center gap-6 bg-background/50 backdrop-blur-lg z-30 text-text w-full border-b border-border">
         <button onClick={() => navigate(-1)} className="p-3 rounded-full hover:bg-border/40">
           <ArrowLeftIcon size={24} />
         </button>
        <div>
          <h1 className="text-3xl font-bold">Reatribuir Usuário</h1>
          <p className="text-secondaryText">
            Movendo <span className="font-bold text-text">{user.fullname}</span> do sistema <span className="font-bold text-text">{oldSystem.hostname}</span>
          </p>
        </div>
      </header>
      
    <div className="w-full max-w-xl mx-auto text-text py-12">
      <div className="space-y-6">
        <Dropdown
          label="Selecione o Novo Sistema de Destino"
          options={systemOptions}
          selected={selectedSystem ? { value: selectedSystem.id, label: `${selectedSystem.hostname} ${selectedSystem.user ? `(Ocupado por ${selectedSystem.user.fullname})` : '(Disponível)'}` } : null}
          onSelect={(option) => setSelectedSystem(allSystems.find(s => s.id === option.value) || null)}
        />
        <div className="flex justify-end pt-4">
          <Button onClick={handleReassignClick} disabled={isLoading || !selectedSystem} iconLeft={isLoading ? <CircleNotchIcon className="animate-spin" /> : <UserSwitchIcon />}>
            {isLoading ? 'Reatribuindo...' : 'Confirmar Reatribuição'}
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onConfirm={confirmAndExecuteReassignment}
        title="Confirmar Substituição"
        message={
          <p>
            O sistema <strong className="text-text">{selectedSystem?.hostname}</strong> já está ocupado por <strong className="text-text">{selectedSystem?.user?.fullname}</strong>.
            Deseja desvincular o usuário atual e atribuir <strong className="text-text">{user.fullname}</strong> a este sistema?
          </p>
        }
        confirmText="Sim, Substituir"
        variant="danger"
      />
    </div>
    </main>
  );
};

export default ReassignUserPage;
