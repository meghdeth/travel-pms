'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../utils/auth'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import Dashboard from '../../components/Dashboard/Dashboard'

export default function HotelDashboard() {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Use fallback to sessionStorage if AuthContext user is null
  const user = authUser || auth.getUser()

  useEffect(() => {
    // Add a small delay to ensure sessionStorage is available after login redirect
    const checkAuth = () => {
      const sessionUser = auth.getUser()
      const sessionToken = auth.getToken()
      const isAuthenticated = authUser || (sessionToken && sessionUser)
      
      console.log('🔍 [Dashboard] AuthContext user:', authUser)
      console.log('🔍 [Dashboard] SessionStorage user:', sessionUser)
      console.log('🔍 [Dashboard] SessionStorage token:', sessionToken ? 'EXISTS' : 'MISSING')
      console.log('🔍 [Dashboard] Final user object:', user)
      console.log('🔍 [Dashboard] Is authenticated:', isAuthenticated)
      
      if (!isAuthenticated) {
        console.log('🔍 [Dashboard] Not authenticated, redirecting to login')
        router.push('/login')
        return
      }
      
      // Route to appropriate dashboard based on role
      const userRole = sessionUser?.role || authUser?.role
      console.log('🔍 [Dashboard] User role:', userRole)
      
      if (userRole === 'Hotel Admin') {
        console.log('🔍 [Dashboard] Redirecting admin to admin dashboard')
        router.push('/admin-dashboard')
        return
      } else if (userRole) {
        console.log('🔍 [Dashboard] Redirecting staff to staff dashboard')
        router.push('/staffdashboard')
        return
      }
      
      setLoading(false)
    }
    
    // Small delay to ensure sessionStorage is ready after navigation
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [authUser, user, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-area flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  )
}