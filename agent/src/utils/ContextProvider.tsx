
import React, { createContext, useState, useEffect, useContext } from "react";
import { SystemInterface } from './systemInterface'

interface ContextInterface {
  systemInfo: SystemInterface | null;
  userData: any | null; // Prisma User + related data
  login: (email: string, password: string) => Promise<boolean>;
}

export const AppContext = createContext<ContextInterface>({
  systemInfo: null,
  userData: null,
  login: async () => false
});

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInterface | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    window.electronAPI.getSystemInfo()
      .then((info: SystemInterface) => setSystemInfo(info))
      .catch(console.error);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await window.electronAPI.login(email, password);
      if (res.success) {
        setUserData(res.user);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ systemInfo, userData, login }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useAppContext must be used inside AppProvider");
  return context;
}


