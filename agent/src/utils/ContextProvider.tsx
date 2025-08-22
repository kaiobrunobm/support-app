import React, { createContext, useContext, useState, useEffect } from 'react'
import { SystemInterface } from './systemInterface'

interface ContextProviderInterface {
  children: React.ReactNode
}

const AppContext = createContext<SystemInterface | undefined>(undefined)

export const ContextProvider: React.FC<ContextProviderInterface> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInterface | null>(null)

  useEffect(() => {
    window.electronAPI.getSystemInfo().then((info: SystemInterface) => {
      console.log(info)
      setSystemInfo(info)
    })
  }, [])


  return (
    <AppContext.Provider value={systemInfo}>
      {children}
    </AppContext.Provider>
  )
}


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useAppContext must be used inside AppProvider");
  return context;
}


