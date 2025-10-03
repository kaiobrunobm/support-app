import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleNotchIcon } from '@phosphor-icons/react';
import * as apiService from '../../api/apiService';
import { TicketSummary } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Tabs from '../../components/TicketsTabs';
import Avatar from '../../components/Avatar';
import { ScrollArea } from 'radix-ui';

type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED';

const tabs = [
  { id: 'OPEN', label: 'Abertos' },
  { id: 'PENDING', label: 'Meus Pendentes' },
  { id: 'RESOLVED', label: 'Resolvidos' },
];

const TicketsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TicketStatus>('OPEN');
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getTicketsByStatus(activeTab);
        if (response.data.status === 'success') {
          setTickets(response.data.data.tickets);
        } else {
          throw new Error('Failed to fetch tickets.');
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar a lista de chamados.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [activeTab]); 

  const handleTicketSelect = (ticketId: string) => {
    navigate(`/app/tickets/${ticketId}`);
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Chamados</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onTabClick={(tabId) => setActiveTab(tabId as TicketStatus)} />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <CircleNotchIcon size={40} weight="bold" className="animate-spin text-text" />
          </div>
        ) : error ? (
          <div className="text-error text-center p-8">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <ScrollArea.Root>
              <ScrollArea.Viewport className='w-full h-full'>

                <table className="min-w-full divide-y divide-border bg-background">
                  <thead className="bg-muted/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText flex items-center justify-center min-w-48">Solicitante</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText min-w-48">Setor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText min-w-48">Assunto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText min-w-48">Sistema</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondaryText min-w-48">Data de Abertura</th>
                      {activeTab !== 'OPEN' && (
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-secondaryText min-w-48">Técnico</th>
                  )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tickets.length > 0 ? tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket.id)}
                        className="cursor-pointer transition-all duration-150 ease-in-out hover:bg-border/60"
                      >
                        <td className=" flex items-center justify-center whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar avatarUrl={ticket.requester.avatarUrl} />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium">{ticket.requester.sector}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium">{ticket.subject}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-secondaryText">{ticket.system.hostname}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-secondaryText">
                          {format(new Date(ticket.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        {activeTab !== 'OPEN' && (
                      <td className="whitespace-nowrap px-6 py-4">
                        {ticket.assignee ? (
                          <div className="flex items-center justify-center gap-2">
                            <Avatar {...ticket.assignee} />
                          </div>
                        ) : (
                          <span className="text-xs text-secondaryText italic">N/A</span>
                        )}
                      </td>
                    )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center text-secondaryText p-8">Nenhum chamado encontrado nesta categoria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <ScrollArea.Scrollbar orientation="horizontal">
                  <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
              </ScrollArea.Viewport>
              <ScrollArea.Corner className='flex bg-border' />
            </ScrollArea.Root>

          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsListPage;
