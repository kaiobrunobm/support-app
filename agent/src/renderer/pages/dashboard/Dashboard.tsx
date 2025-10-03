import React, { useState } from 'react'
import { useAppContext } from '../../context/ContextProvider';
import Hardware from './sections/Hardware';
import Network from './sections/Network';
import OperatingSystems from './sections/OperatingSystems';
import Printers from './sections/Printers';
import { CheckCircleIcon, CircleNotchIcon, ClockIcon, HardDrivesIcon, PlusIcon, TicketIcon, UsersIcon, PencilSimpleIcon, ChatCircleDotsIcon, ChatIcon, UserPlusIcon, UserSwitchIcon } from '@phosphor-icons/react';
import anydeskIcon from '/anydesk-icon.png'
import { useNavigate } from 'react-router';
import StatCard from '../../components/StatsCard';
import { useDashboardStats } from '../../hooks/DashboardStats';
import Modal from '../../components/Modal';
import * as apiService from '../../api/apiService'
import { toast } from 'sonner';
import Input from '../../components/Input';
import Button from '../../components/Button';
import CreateTicketModal from '../../components/TicketModal';
import UserPopover from '../../components/UserPopover';
import {  MenuItem,PopoverButton } from '@headlessui/react';

import SimplePopover from '../../components/SimpleDropdown';


const Dashboard: React.FC = () => {
  const { systemInfo, setSystemInfo, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anydeskId, setAnydeskId] = useState(systemInfo?.anydesk || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  const [isCheckingTicket, setIsCheckingTicket] = useState(false);


  const navigate = useNavigate();

  const handleCallSupportClick = async () => {
    setIsCheckingTicket(true);
    try {
      const response = await apiService.getMyActiveTicket();


      const activeTicketId = response.data.data.ticket.id;
      toast.info('Você já tem um chamado ativo. Redirecionando...');
      navigate(`/app/tickets/${activeTicketId}`);

    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setIsTicketModalOpen(true);
      } else {
        console.error('Failed to check for active ticket:', err);
        toast.error('Não foi possível verificar seus chamados. Tente novamente.');
      }
    } finally {
      setIsCheckingTicket(false);
    }
  };

  const handleOpenModal = () => {
    setAnydeskId(systemInfo?.anydesk || '');
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemInfo) return;
    setIsUpdating(true);

    try {
      const response = await apiService.updateSystemDetails(systemInfo.id, { anydesk: anydeskId });
      if (response.data.status === 'success') {
        setSystemInfo(response.data.data.system);
        toast.success('AnyDesk ID atualizado com sucesso!');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar o sistema.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddUserClick = () => {
    if (systemInfo) {
      navigate('/create-user', {
        state: {
          systemId: systemInfo.id,
          hostname: systemInfo.hostname
        }
      });
    }
  };

  const handleAddExistingUser = () => {
    if (systemInfo) {
      navigate('/assign-user', {
        state: {
          systemId: systemInfo.id,
          hostname: systemInfo.hostname
        }
      });
    }
  };

  {
    if (!systemInfo) {
      return (
        <section className='bg-background text-text h-full w-screen flex flex-col justify-center items-center mt-10 '>
          <CircleNotchIcon size={40} weight='bold' className='animate-spin' />
        </section>
      )
    }

  }

  const isAdminOrIT = user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT';

  console.log(systemInfo.user)
  return (
    <>
      <div className='w-full space-y-8
      '>
        {isAdminOrIT && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Chamados Abertos" value={stats?.openTickets ?? 0} IconComponent={TicketIcon} isLoading={isLoadingStats} colorClass="text-orange-500" />
            <StatCard title="Chamados Pendentes" value={stats?.pendingTickets ?? 0} IconComponent={ClockIcon} isLoading={isLoadingStats} colorClass="text-yellow-500" />
            <StatCard title="Resolvidos Hoje" value={stats?.resolvedToday ?? 0} IconComponent={CheckCircleIcon} isLoading={isLoadingStats} colorClass="text-green-500" />
            <StatCard title="Total de Sistemas" value={stats?.totalSystems ?? 0} IconComponent={HardDrivesIcon} isLoading={isLoadingStats} colorClass="text-blue-500" />
            <StatCard title="Sistemas sem Usuário" value={stats?.systemsNeedingUsers ?? 0} IconComponent={UsersIcon} isLoading={isLoadingStats} colorClass="text-red-500" />

          </div>
        )}
        <section className='bg-background text-text flex flex-col items-start'>
          <div className='w-full flex justify-between items-center px-3 py-1.5'>
            <div>
              <h1 className='text-3xl font-bold'>Visão geral</h1>
              <span className='uppercase font-light flex items-center gap-2'>{systemInfo.domain} - <div className='lowercase'>{systemInfo.uptime}</div> </span>
            </div>
            <div className='flex flex-col items-end gap-2.5'>
              {systemInfo.user && user.id !== systemInfo.user.id ? (
                <UserPopover user={systemInfo.user} system={systemInfo} context="list" />
              ) : (
                isAdminOrIT && !systemInfo.user && (
                <SimplePopover popoverButton={
                        <PopoverButton className="flex items-center gap-2.5 cursor-pointer text-primary hover:underline">
                          Adicionar usuário
                          <PlusIcon size={20} />
                        </PopoverButton>
                }>
                    <MenuItem>
                          <button onClick={handleAddUserClick} className={` group flex w-full items-center rounded-t-md px-4 py-3 text-sm transition-all duration-150 easy-in hover:bg-border/50`}>
                            <UserPlusIcon className="mr-2 h-5 w-5" />
                            Criar Novo Usuário
                          </button>
                        
                      </MenuItem>
                      <MenuItem>
                          <button onClick={handleAddExistingUser} className={` group flex w-full items-center rounded-b-md px-4 py-3 text-sm transition-all duration-150 easy-in hover:bg-border/50`}>
                            <UserSwitchIcon className="mr-2 h-5 w-5" />
                            Atribuir Usuário Existente
                          </button>
                        </MenuItem>
              </SimplePopover>
                )
                )}
              {isAdminOrIT && systemInfo.user && (
                <button onClick={handleOpenModal} className='flex items-center gap-2.5 font-bold text-[#ED3A47] cursor-pointer hover:underline'>
                  {systemInfo.anydesk ? (
                    <>
                      <img src={anydeskIcon} alt="anydesk icon" className="h-5 w-5" />
                      <p>{systemInfo.anydesk}</p>
                    </>
                  ) : (
                    'Adicionar Anydesk'
                  )}
                  <PencilSimpleIcon size={16} className="opacity-60" />
                </button>
              )}

              {systemInfo.user && systemInfo.anydesk && !isAdminOrIT && (
                <div className='flex items-center gap-2.5 font-bold text-[#ED3A47] cursor-pointer hover:underline'>
                      <img src={anydeskIcon} alt="anydesk icon" className="h-5 w-5" />
                      <p>{systemInfo.anydesk}</p>
                </div>
              )}
            </div>
          </div>

          <OperatingSystems system={systemInfo.distro} version={systemInfo.release || 'Nenhuma versão encontrada'} arch={systemInfo?.arch} kernel={systemInfo?.kernel} />
          <Hardware cpu={`${systemInfo.hardware.cpu.model}`} ram={`${systemInfo.hardware.memory.map(memory => memory.size).reduce((a, b) => a + b, 0)}gb`} storage={systemInfo?.disks} />
          <Network adapter={systemInfo.network.adapters.filter(adapter => adapter.ip.startsWith('192') || adapter.ip.startsWith('10'))} publicIp={systemInfo?.network.publicIP} />
          <Printers printers={systemInfo.printers} />
        </section >
        {user?.role === 'USER' && (
          <Button
            onClick={handleCallSupportClick}
            className="fixed bottom-12 right-12 z-40 h-16 w-16 bg-border flex items-center justify-center rounded-full"
          >
            <ChatIcon size={24} weight='bold' />
          </Button>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Informações do Sistema">
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label htmlFor="anydesk" className="block text-sm font-medium text-secondaryText mb-1">
              AnyDesk ID
            </label>
            <Input
              id="anydesk"
              name="anydesk"
              placeholder="Digite o ID do AnyDesk"
              value={anydeskId}
              onChange={(e) => setAnydeskId(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <CircleNotchIcon className="animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Modal>

      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </>
  )
}

export default Dashboard
