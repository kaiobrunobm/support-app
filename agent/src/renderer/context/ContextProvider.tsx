import React, { createContext, useContext, useState, useEffect } from "react";
import { SystemInfo, AppUser, SystemSummary, } from "../types";
import axios from 'axios';
import { config } from "../../config";
import io, { Socket } from 'socket.io-client';
import * as apiService from '../api/apiService';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
});

interface AppContextInterface {
  systemInfo: SystemInfo | null;
  user: AppUser | null;
  isLoading: boolean;
  allSystems: SystemSummary[];
  fetchSystems: () => Promise<void>;
  updateSystemInList: (updatedSystem: SystemInfo | SystemSummary) => void;
  socket: Socket | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setSystemInfo: React.Dispatch<React.SetStateAction<SystemInfo | null>>;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  updateUserForSystem: (systemId: string, user: AppUser | null) => void;

}

const AppContext = createContext<AppContextInterface | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [allSystems, setAllSystems] = useState<SystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  

  const login = async (email: string, password: string) => {
    const { data } = await apiService.login(email, password);
    console.log(data)

    if (data.status === 'success' && data.data.token) {
      const { user, token } = data.data;

      localStorage.setItem("token", token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      setSystemInfo(user.system);

      if (socket) socket.disconnect();

      const newSocket = io(config.apiUrl, {
        auth: { token }
      });
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


    window.electronAPI.getSystemInfo()
      .then((info: SystemInfo) => setSystemInfo(info))
      .catch(console.error);
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
            const loggedInUser = data.data.user;
            setUser(loggedInUser);
            setSystemInfo(loggedInUser.system);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auto-login failed, token may be expired.", err);
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

    // Cleanup function to disconnect socket when the app closes or component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

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
      setSystemInfo(prevInfo => {
        if (!prevInfo) return null;
        return {
          ...prevInfo,
          user: user
        };
      });
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
    fetchSystems,
    updateSystemInList,
    updateUserForSystem,
    setUser
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

