import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from './auth.service'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated())
  const [user, setUser] = useState(AuthService.getUser())

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated())
    setUser(AuthService.getUser())
  }, [])

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password })
    AuthService.setToken(response.token)
    AuthService.setUser(response.user)
    setIsAuthenticated(true)
    setUser(response.user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await AuthService.signup({ name, email, password })
    AuthService.setToken(response.token)
    AuthService.setUser(response.user)
    setIsAuthenticated(true)
    setUser(response.user)
  }

  const logout = () => {
    AuthService.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}