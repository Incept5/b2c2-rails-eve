import React, { createContext, useContext } from 'react'
import { AuthContextType } from './auth.types'

const NoAuthContext = createContext<AuthContextType | undefined>(undefined)

export function NoAuthProvider({ children }: { children: React.ReactNode }) {
  const noAuthValue: AuthContextType = {
    isAuthenticated: false,
    user: null,
    login: async () => {
      console.warn('Auth is disabled - login not available')
    },
    signup: async () => {
      console.warn('Auth is disabled - signup not available')
    },
    logout: () => {
      console.warn('Auth is disabled - logout not available')
    }
  }

  return (
    <NoAuthContext.Provider value={noAuthValue}>
      {children}
    </NoAuthContext.Provider>
  )
}

export function useNoAuth() {
  const context = useContext(NoAuthContext)
  if (context === undefined) {
    throw new Error('useNoAuth must be used within a NoAuthProvider')
  }
  return context
}
