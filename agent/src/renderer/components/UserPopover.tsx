import React, { Fragment, useState } from 'react';
import { Popover, Transition, PopoverButton, PopoverPanel } from '@headlessui/react';
import { AppUser, SystemInfo, SystemSummary } from '../types';
import { useAppContext } from '../context/ContextProvider';

import Avatar from './Avatar';
import Button from './Button';
import { PencilSimpleIcon, SwapIcon, TrashIcon, PhoneIcon, GlobeIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import * as apiService from '../api/apiService';
import ConfirmationModal from './ConfirmationModal';
import { useNavigate } from 'react-router';

interface UserPopoverProps {
  user: AppUser;
  system: SystemInfo | SystemSummary | null;
  context: 'header' | 'list' | 'chat';
}

const UserPopover: React.FC<UserPopoverProps> = ({ user, system, context }) => {
  const { user: loggedInUser, setSystemInfo, updateSystemInList } = useAppContext();
  const [isDetachModalOpen, setIsDetachModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const navigate = useNavigate();


  const isAdminOrIT = loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'IT_SUPPORT';

  const handleDetach = async () => {
    if (!system) return;
    try {
      await apiService.detachUser(system.id);
      toast.success(`${user.fullname} foi desvinculado com sucesso.`);
      const updatedSystem: SystemInfo | SystemSummary = { ...system, user: null };

      setSystemInfo(updatedSystem as SystemInfo);

      updateSystemInList(updatedSystem);
      
    } catch (err) {
      toast.error('Falha ao desvincular o usuário.');
    } finally {
      setIsDetachModalOpen(false); 
    }
  };

  const handleStartReassignment = () => {
    setIsReassignModalOpen(false);
    navigate('/app/reassign-user', { state: { user, system } });
  };
  
  const handleEditProfile = () => {
    navigate(`/app/users/${user.id}/edit`)
  };

  return (
    <>
    <Popover className="relative z-90">
      <PopoverButton className="outline-none">
        <Avatar {...user} />
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute -right-24 top-5 z-90 mt-3 w-72 bg-background -translate-x-1/2 transform px-4 sm:px-0">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-text ring-opacity-5">
            <div className="relative flex flex-col bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className='flex items-center gap-3'>
                <div className="flex-shrink-0">
                  <Avatar {...user} />
                </div>
                <div>
                  <p className="text-base font-bold text-text">{user.fullname}</p>
                  <p className="text-sm text-secondaryText">{user.sector}</p>
                </div>          
                </div>
                {isAdminOrIT && context !== 'header' && (
                <button onClick={() => setIsDetachModalOpen(true)} className="px-3 py-3 text-error rounded-full transition-all duration-150 ease-in-out hover:bg-error/10">
                    <TrashIcon size={16} />
                </button>
                )}            
              </div>

              <div className="mt-4 space-y-2 pt-2 text-sm">
                <div className="flex items-center gap-2 text-secondaryText">
                  <PhoneIcon size={16} />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-secondaryText">
                  <GlobeIcon size={16} />
                  <span>{system?.hostname || 'N/A'}</span> {/* Added optional chaining */}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                <Button variant="secondary" onClick={handleEditProfile} iconLeft={<PencilSimpleIcon size={16}/>} className='w-full'>
                  Editar
                </Button>

                {isAdminOrIT && context !== 'header' && (
                  <div className="flex items-center gap-2">
                    <button  onClick={() => setIsReassignModalOpen(true)} className='flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-150 easy-in-out hover:bg-border/50'>
                      <SwapIcon size={16} />
                      Reatribuir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
    <ConfirmationModal  
        isOpen={isDetachModalOpen}
        onClose={() => setIsDetachModalOpen(false)}
        onConfirm={handleDetach}
        title="Confirmar Desvinculação"
        message={
          <p>
            Tem certeza que deseja desvincular <strong className="text-text">{user.fullname}</strong> do sistema <strong className="text-text">{system?.hostname}</strong>?
          </p>
        }
        confirmText="Sim"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onConfirm={handleStartReassignment}
        title="Iniciar Reatribuição"
        message={
          <p>
            Isso irá desvincular <strong className="text-text">{user.fullname}</strong> do sistema atual (<strong className="text-text">{system?.hostname}</strong>). Deseja continuar?
          </p>
        }
        confirmText="Continuar"
        variant="primary"
      />
      </>
  );
};

export default UserPopover;
