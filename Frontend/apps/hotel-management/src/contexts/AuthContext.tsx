'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, logoutUser, initializeAuth } from '../store/slices/authSlice'

interface AuthContextType {
  user: any
  hotel: any
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🚀 [AuthProvider] Component initialized')
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, hotel, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  // Initialize auth state on component mount
  useEffect(() => {
    console.log('🔄 [AuthProvider] Initializing auth state')
    dispatch(initializeAuth())
  }, [dispatch])

  // Debug user state changes
  useEffect(() => {
    console.log('🔍 [AuthContext] User state changed:', user)
    console.log('🔍 [AuthContext] User role:', user?.role)
    console.log('🔍 [AuthContext] User role name:', user?.role?.name)
    console.log('🔍 [AuthContext] User role code:', user?.role?.code)
  }, [user])

  const login = async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap()
      console.log('AuthContext - Login result:', result)
      return result
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/login')
    }
  }

  const refreshAuth = () => {
    dispatch(initializeAuth())
  }

  const value = {
    user,
    hotel,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
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