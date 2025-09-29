import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleNotchIcon, DesktopTowerIcon, QuestionMarkIcon } from '@phosphor-icons/react';
import { useAppContext } from '../../context/ContextProvider';
import * as apiService from '../../api/apiService';
import { SystemInfo } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
import Avatar from '../../components/Avatar';

// Define the type for the summarized system object returned by the API
type SystemSummary = Pick<SystemInfo, 'id' | 'hostname' | 'distro' | 'createdAt' | 'user'> & {
  network: { adapters: { ip?: string }[] };
};

const SystemsListPage: React.FC = () => {
  const { setSystemInfo } = useAppContext();
  const navigate = useNavigate();
  const [systems, setSystems] = useState<SystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await apiService.getAllSystems();
        if (response.data.status === 'success') {
          setSystems(response.data.data.systems);
        } else {
          throw new Error('Failed to fetch systems list.');
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar a lista de sistemas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystems();
  }, []);

  const handleSystemSelect = async (systemId: string) => {
    try {
      // When a system is selected, fetch its FULL details
      const response = await apiService.getSystemById(systemId);
      // Update the global context with the full system information
      setSystemInfo(response.data);
      // Navigate the user to the main dashboard to view the details
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Failed to fetch system details:', err);
      // You could show a toast notification here
    }
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
  //TODO calculate the total of ticket per system/user
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Sistemas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border bg-background">
          <thead className="bg-muted/50">
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
            {systems.map((system) => (
              <tr
                key={system.id}
                onClick={() => handleSystemSelect(system.id)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <DesktopTowerIcon size={24} className="text-primary" />
                    <span className="font-medium">{system.hostname}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-secondaryText">{system.network?.adapters[0]?.ip || 'N/A'}</td>
                
                <td className="whitespace-nowrap px-6 py-4 text-secondaryText flex items-end justify-center">
                  3 
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-secondaryText">
                  {formatDistanceToNow(new Date(system.createdAt), { addSuffix: true, locale: ptBR })}
                </td>
                <td className="flex items-center justify-center whitespace-nowrap px-6 py-4">
                  {system.user ? (
                    <div className="flex items-center gap-2">
                      <Avatar {...system.user} />
                    </div>
                  ) : (
                    <div className='h-8 w-8 flex items-center justify-center rounded-full bg-border'>
                      <QuestionMarkIcon size={24}/>                  
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemsListPage;
