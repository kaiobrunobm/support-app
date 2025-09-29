import React, { createContext, useContext, useState, useEffect } from "react";
import { SystemInfo, AppUser } from "../types";
import axios from 'axios';
import { config } from "../../config";
import io, { Socket } from 'socket.io-client'; // 1. Import Socket.IO client
import * as apiService from '../api/apiService';

// Create a reusable Axios instance
export const apiClient = axios.create({
  baseURL: config.apiUrl,
});

interface AppContextInterface {
  systemInfo: SystemInfo | null;
  user: AppUser | null;
  isLoading: boolean;
  socket: Socket | null; // Add socket instance to the context
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setSystemInfo: (system: SystemInfo | null) => void;
}

const AppContext = createContext<AppContextInterface | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const login = async (email: string, password: string) => {
    const { data } = await apiService.login(email, password);
    
    if (data.status === 'success' && data.data.token) {
      const { user, token } = data.data;
      
      // Store token and set HTTP header
      localStorage.setItem("token", token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user and system state
      setUser(user);
      setSystemInfo(user.system);

      // --- 2. CONNECT SOCKET ON LOGIN ---
      // Disconnect any existing socket before creating a new one
      if (socket) socket.disconnect();
      
      // Create a new socket connection, passing the token for authentication
      const newSocket = io(config.apiUrl, {
        auth: { token }
      });
      setSocket(newSocket);
      // ---------------------------------
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

  const contextValue = { login, logout, user, systemInfo, setSystemInfo, isLoading, socket };

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

