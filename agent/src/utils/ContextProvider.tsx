import React, { createContext, useContext, useState, useEffect } from "react";
import { SystemInterface } from "./systemInterface";

interface User {
  email: string;
  token?: string;
  role?: string;
}

interface ContextInterface {
  systemInfo: SystemInterface | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
}

const AppContext = createContext<ContextInterface | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInterface | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
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
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSystemInfo(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch("https://support-app-backend.vercel.app/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setSystemInfo(data.user.system);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Auto login failed", err);
        logout();
      }
    })();
  }, []);

  return (
    <AppContext.Provider value={{ login, logout, user, systemInfo }}>
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

