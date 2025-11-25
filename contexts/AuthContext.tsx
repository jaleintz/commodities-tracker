'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  isAdmin: boolean
  signIn: (email: string, useLevel: string | null) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const { email, useLevel } = JSON.parse(stored)
      setUserEmail(email)
      setIsAuthenticated(true)
      setIsAdmin(useLevel === 'admin')
    }
  }, [])

  const signIn = (email: string, useLevel: string | null) => {
    setIsAuthenticated(true)
    setUserEmail(email)
    setIsAdmin(useLevel === 'admin')
    localStorage.setItem('auth', JSON.stringify({ email, useLevel }))
  }

  const signOut = () => {
    setIsAuthenticated(false)
    setUserEmail(null)
    setIsAdmin(false)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, isAdmin, signIn, signOut }}>
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
