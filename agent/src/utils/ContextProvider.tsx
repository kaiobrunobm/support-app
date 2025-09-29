import React, { createContext, useContext, useState, useEffect } from "react";
import { SystemInterface } from "./systemInterface";
import axios from 'axios';
import { config } from "../config";

interface User {
  id: string;
  fullname: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'IT_SUPPORT';
  sector: string;
  phone: string;
  loginDate: string;
  avatarUrl?: string | null
}

interface ContextInterface {
  systemInfo: SystemInterface | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setSystemInfo: (system: SystemInterface | null) => void;
}

const AppContext = createContext<ContextInterface | undefined>(undefined);

export const apiClient = axios.create({
  baseURL: config.apiUrl,
});

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInterface | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/auth/login`, { email, password });
      
     
      if (res.data.status === 'success' && res.data.data) {
        const { user, token } = res.data.data;

        localStorage.setItem("token", token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        setSystemInfo(user.system); 
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    window.electronAPI.getSystemInfo()
      .then((info: SystemInterface) => setSystemInfo(info))
      .catch(console.error);
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await apiClient.get('/auth/me');
          
          if (res.data.status === 'success' && res.data.data) {
            const { user } = res.data.data;
            setUser(user);
            setSystemInfo(user.system);
            
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auto login failed, token might be expired.", err);
          logout();
        }
      } else {
        try {
          if(systemInfo === undefined || systemInfo === null) {
            const info = await window.electronAPI.getSystemInfo();
            setSystemInfo(info);
          }
        } catch (error) {
          console.error("Could not get local system info:", error);
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);
  
  console.log(systemInfo)
  return (
    <AppContext.Provider value={{ login, logout, user, systemInfo, setSystemInfo, isLoading }}>
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

