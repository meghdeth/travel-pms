'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VendorLanding from './landing/page'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('vendor_token')
    if (token) {
      setIsAuthenticated(true)
      router.push('/dashboard')
    } else {
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <VendorLanding />
  }

  // This will redirect to dashboard for authenticated users
  return null
}