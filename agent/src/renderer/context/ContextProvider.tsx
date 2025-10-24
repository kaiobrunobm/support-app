import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { SystemInfo, AppUser, SystemSummary, Message, TicketSummary } from "../types";
import io, { Socket } from 'socket.io-client';
import * as apiService from '../api/apiService';
import { config } from "../../config";
import { useNotification } from "./NotificationContext";
import axios from "axios";
import { toast } from "sonner";
import ChatToast from "../components/ChatToast";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
});

interface AppContextInterface {
  systemInfo: SystemInfo | null;
  user: AppUser | null;
  isLoading: boolean;
  allSystems: SystemSummary[];
  ticketsByStatus: {
    OPEN: TicketSummary[];
    PENDING: TicketSummary[];
    RESOLVED: TicketSummary[];
    CANCELLED: TicketSummary[];
  };
  fetchSystems: () => Promise<void>;
  fetchTicketsByStatus: (status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CANCELLED') => Promise<void>;
  updateSystemInList: (updatedSystem: SystemInfo | SystemSummary) => void;
  socket: Socket | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setSystemInfo: React.Dispatch<React.SetStateAction<SystemInfo | null>>;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  updateUserForSystem: (systemId: string, user: AppUser | null) => void;
  setActiveChatId: (ticketId: string | null) => void;
}

const AppContext = createContext<AppContextInterface | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [allSystems, setAllSystems] = useState<SystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [ticketsByStatus, setTicketsByStatus] = useState<AppContextInterface['ticketsByStatus']>({
    OPEN: [],
    PENDING: [],
    RESOLVED: [],
    CANCELLED: []
  });

  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!socket || !user) return;

    

    const handleNewTicket = (ticket: TicketSummary) => {
      if ((user.role === 'ADMIN' || user.role === 'IT_SUPPORT') && ticket.requester) {
        addNotification({
          title: 'Novo Chamado Aberto',
          body: `De: ${ticket.requester.fullname}`,
          type: 'new-ticket',
          ticketId: ticket.id,
          senderAvatarUrl: ticket.requester.avatarUrl,
        });
        
        setTicketsByStatus(prev => ({
          ...prev,
          OPEN: [ticket, ...prev.OPEN]
        }));

        return toast.custom((id) => (
            <ChatToast
              id={id}
              ticketId=''
              title={`Novo chamado aberto`}
              body={`Novo chamado aberto por ${ticket.requester.fullname} - ${ticket.requester.sector}`}/>
          ));
      }
    };

    const handleNewMessage = async (message: Message & { ticketId: string }) => {
      if (message.ticketId === activeChatId) return;

      try {
        const response = await apiService.getTicketById(message.ticketId);
        const ticketData = response.data.status === 'success' ? response.data.data.ticket : undefined;
        
        if (!ticketData || !ticketData.requester || !message.sender) return;

        const isRequester = user.id === ticketData.requester.id;
        const isAssignee = user.id === ticketData.assignee?.id;
        const isNotSender = user.id !== message.senderId;

        if ((isRequester || isAssignee) && isNotSender) {
          addNotification({
            title: `Nova mensagem`,
            body: `${message.sender.fullname} : ${message.content}`,
            type: 'new-message',
            ticketId: message.ticketId,
            senderAvatarUrl: message.sender.avatarUrl,  
          });

          return toast.custom((id) => (
            <ChatToast
              id={id}
              ticketId={message.ticketId}
              title={`Nova mensagem de ${message.sender.fullname}`}
              body={`${message.content}`}/>
          ));
        }
      } catch (error) {
        console.error('Error processing message for notification:', error);
      }
    };

    const handleTicketStatusUpdate = (updatedTicket: TicketSummary) => {
      setTicketsByStatus(prev => {
        const newLists: AppContextInterface['ticketsByStatus'] = { ...prev };

        Object.keys(newLists).forEach(status => {
          const key = status as keyof typeof newLists;
          newLists[key] = newLists[key].filter(t => t.id !== updatedTicket.id);
        });

        if (newLists[updatedTicket.status]) {
          newLists[updatedTicket.status].unshift(updatedTicket);
        }

        return newLists;
      });
    };

    socket.on('newTicket', handleNewTicket);
    socket.on('receiveMessage', handleNewMessage);
    socket.on('ticketStatusUpdated', handleTicketStatusUpdate);

    return () => {
      socket.off('newTicket', handleNewTicket);
      socket.off('receiveMessage', handleNewMessage);
      socket.off('ticketStatusUpdated', handleTicketStatusUpdate);
    };
  }, [socket, user, navigate, activeChatId, addNotification]);

  const login = async (email: string, password: string) => {
    const { data } = await apiService.login(email, password);
    if (data.status === 'success' && data.data.token) {
      const { user, token } = data.data;
      localStorage.setItem("token", token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setSystemInfo(user.system);
      if (socket) socket.disconnect();
      const newSocket = io(config.apiUrl, { auth: { token } });
      setSocket(newSocket);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    window.electronAPI.getSystemInfo().then((info: SystemInfo) => setSystemInfo(info)).catch(console.error);
  };

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const newSocket = io(config.apiUrl, { auth: { token } });
        setSocket(newSocket);
        try {
          const { data } = await apiService.getMe();
          if (data.status === 'success' && data.data.user) {
            setUser(data.data.user);
            setSystemInfo(data.data.user.system);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auto-login failed:", err);
          logout();
        }
      } else {
        try {
          const info = await window.electronAPI.getSystemInfo();
          setSystemInfo(info);
        } catch (error) {
          console.error("Could not get local system info:", error);
        }
      }
      setIsLoading(false);
    };
    initializeApp();
    return () => { if (socket) socket.disconnect(); };
  }, []);

  const fetchTicketsByStatus = async (status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CANCELLED') => {
    try {
      const response = await apiService.getTicketsByStatus(status);
      if (response.data.status === 'success') {
        setTicketsByStatus(prev => ({
          ...prev,
          [status]: response.data.data.tickets,
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${status} tickets`, error);
    }
  };

  const fetchSystems = async () => {
    try {
      const response = await apiService.getAllSystems();
      if (response.data.status === 'success') {
        setAllSystems(response.data.data.systems);
      }
    } catch (error) {
      console.error("Failed to fetch systems list", error);
    }
  };

  const updateSystemInList = (updatedSystem: SystemInfo | SystemSummary) => {
    setAllSystems(prevSystems =>
      prevSystems.map(sys =>
        sys.id === updatedSystem.id ? { ...sys, user: (updatedSystem as SystemInfo).user || null } : sys
      )
    );
  };

  const updateUserForSystem = (systemId: string, user: AppUser | null) => {
    setAllSystems(prevSystems =>
      prevSystems.map(sys =>
        sys.id === systemId ? { ...sys, user: user } : sys
      )
    );
    if (systemInfo && systemInfo.id === systemId) {
      setSystemInfo(prevInfo => prevInfo ? { ...prevInfo, user: user } : null);
    }
  };

  const contextValue = {
    login,
    logout,
    user,
    systemInfo,
    setSystemInfo,
    isLoading,
    socket,
    allSystems,
    ticketsByStatus,
    fetchSystems,
    fetchTicketsByStatus,
    updateSystemInList,
    updateUserForSystem,
    setUser,
    setActiveChatId,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside ContextProvider");
  }
  return context;
};

