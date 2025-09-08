import React, { createContext, useContext, useState, useEffect } from 'react'
import { SystemInterface } from './systemInterface'

interface User {
  email: string
  token?: string
  role?: string
}

interface ContextInterface {
  user: User | null
  setUser: (user: User | null) => void
  systemInfo: SystemInterface | null
  setSystemInfo: (info: SystemInterface | null) => void
  login: (email: string, password: string) => Promise<boolean>
}

const AppContext = createContext<ContextInterface | undefined>(undefined)

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInterface | null>(null)

  const login = async (email: string, password: string) => {
    try {
      const res = await window.electronAPI.login(email, password) // calls backend /auth/login
      if (res.success) {
        setUser(res.user)
        setSystemInfo(res.user.system) // replace local system with backend system info
        return true
      } else {
        return false
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return (
    <AppContext.Provider value={{ user, setUser, systemInfo, setSystemInfo, login }}>
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

