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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Initialize auth state
    const initAuth = () => {
      const isAuth = AuthService.isAuthenticated()
      const userData = AuthService.getUser()
      
      // Only set authenticated if we have both a token and valid user data
      if (isAuth && userData) {
        setIsAuthenticated(true)
        setUser(userData)
      } else {
        // If we don't have both, clear the auth state
        AuthService.logout()
        setIsAuthenticated(false)
        setUser(null)
      }
    }
    
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password })
    setIsAuthenticated(true)
    setUser(response.user_id)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await AuthService.signup({ name, email, password })
    setIsAuthenticated(true)
    setUser(response.user_id)
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