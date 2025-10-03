import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleNotchIcon, DesktopTowerIcon, PlusIcon, QuestionMarkIcon, UserSwitchIcon } from '@phosphor-icons/react';
import { useAppContext } from '../../context/ContextProvider';
import * as apiService from '../../api/apiService';
import { SystemSummary } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from 'radix-ui';
import UserPopover from '../../components/UserPopover';
import SimplePopover from '../../components/SimpleDropdown';
import { MenuItem, PopoverButton } from '@headlessui/react';
import { UserPlusIcon } from 'lucide-react';


const SystemsListPage: React.FC = () => {
  const { setSystemInfo, fetchSystems, allSystems, systemInfo  } = useAppContext();
  const [systems, setSystems] = useState<SystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadSystems = async () => {
      setIsLoading(true);
      await fetchSystems();
      setIsLoading(false);
    }
    loadSystems();
  }, []);

  const handleSystemSelect = async (systemId: string) => {
    try {
      const response = await apiService.getSystemById(systemId);
      setSystemInfo(response.data);
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Failed to fetch system details:', err);
    }
  };

  const handleAddUser = (event: React.MouseEvent, system: SystemSummary) => {
    event.stopPropagation(); 
    navigate('/app/create-user', {
      state: {
        systemId: system.id,
        hostname: system.hostname,
      },
    });
  };

  const handleAddExistingUser = (event: React.MouseEvent, system: SystemSummary) => {
    event.stopPropagation();
      navigate('/app/assign-user', {
        state: {
          systemId: system.id,
          hostname: system.hostname
        }
    })
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircleNotchIcon size={40} weight="bold" className="animate-spin text-text" />
      </div>
    );
  }

  if (error) {
    return <div className="text-error text-center">{error}</div>;
  }
  return (
    <div className="flex-1 flex-col items-center justify-center w-full">
      <h1 className="text-3xl font-bold mb-6">Sistemas</h1>
      <div className="pb-24">
        <ScrollArea.Root>
          <ScrollArea.Viewport className='flex-1 items-center justify-center w-full h-full '>
            <table className="w-full divide-y divide-border bg-background">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText">
                    Hostname
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText">
                    Endereço IP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText flex items-end justify-items-center">
                    Chamados
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText">
                    Criado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText flex items-center justify-center">
                    Usuario atribuido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allSystems.map((system) => (
                  <tr
                    key={system.id}
                    className="cursor-pointer transition-all duration-150 ease-in-out"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className='p-2 rounded-full hover:bg-border/50'  onClick={() => handleSystemSelect(system.id)}>
                        <DesktopTowerIcon size={24} />
                        </div>
                        <span className="font-medium">{system.hostname}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-secondaryText">{system.network?.adapters[0]?.ip || 'N/A'}</td>

                    <td className="whitespace-nowrap px-6 py-4 text-secondaryText flex items-end justify-center">
                    {system._count.tickets || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-secondaryText">
                      {format(new Date(system.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="flex items-center justify-center whitespace-nowrap px-6 py-4">
                      {system.user ? (
                        <div className="flex items-center gap-2">
                          <UserPopover user={system.user} system={system} context="list" />
                        </div>
                      ) : (

                        <SimplePopover popoverButton={
                        <PopoverButton className="h-8 w-8 flex items-center justify-center rounded-full bg-border">
                          <PlusIcon size={16} weight='bold' />
                        </PopoverButton>
                }>
                    <MenuItem>
                          <button onClick={(e) => handleAddUser(e, system)} className={` group flex w-full items-center rounded-t-md px-4 py-3 text-sm transition-all duration-150 easy-in hover:bg-border/50`}>
                            <UserPlusIcon className="mr-2 h-5 w-5" />
                            Criar Novo Usuário
                          </button>
                        
                      </MenuItem>
                      <MenuItem>
                          <button onClick={(e) => handleAddExistingUser(e, system)} className={` group flex w-full items-center rounded-b-md px-4 py-3 text-sm transition-all duration-150 easy-in hover:bg-border/50`}>
                            <UserSwitchIcon className="mr-2 h-5 w-5" />
                            Atribuir Usuário Existente
                          </button>
                        </MenuItem>
              </SimplePopover>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ScrollArea.Scrollbar orientation="horizontal">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Viewport>
          <ScrollArea.Corner className='flex bg-border' />
        </ScrollArea.Root>

      </div>
    </div>
  );
};

export default SystemsListPage;
