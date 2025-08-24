'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Routes that don't need authentication (public routes)
  const publicRoutes = ['/', '/landing', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('vendor_token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [pathname])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For public routes or unauthenticated users, show content without dashboard layout
  if (isPublicRoute || !isAuthenticated) {
    return <>{children}</>
  }

  // For authenticated users on protected routes, show dashboard layout
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}