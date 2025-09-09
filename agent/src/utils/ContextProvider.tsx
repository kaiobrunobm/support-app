import React, { createContext, useContext, useState, useEffect } from 'react'
import { SystemInterface } from './systemInterface'

interface User {
  email: string
  token?: string
  role?: string
}

interface ContextInterface {
  systemInfo: SystemInterface | null
  login: (email: string, password: string) => Promise<boolean>
  user: User
}

const AppContext = createContext<ContextInterface | undefined>(undefined)

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInterface | null>(null)
  const [user, setUser] = useState(null)

  const login = async (email: string, password: string) => {
    const res = await fetch("https://support-app-backend.vercel.app/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setSystemInfo(data.user.system);
      console.log(systemInfo)
      return true;
    }
    return false;
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch("https://support-app-backend.vercel.app/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setSystemInfo(data.user.system);
        }
      } catch (err) {
        console.error("Auto login failed", err);
        localStorage.removeItem("token");
      }
    })();
  }, []);

  return (
    <AppContext.Provider value={{ login, user, systemInfo }}>
      {children}
    </AppContext.Provider>)
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used inside AppProvider")
  }
  return context
}

