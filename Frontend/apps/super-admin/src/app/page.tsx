'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('superAdminAuthenticated')
    
    if (isAuthenticated) {
      // If authenticated, redirect to dashboard
      router.push('/dashboard')
    } else {
      // If not authenticated, redirect to login (landing page)
      router.push('/login')
    }
  }, [])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}