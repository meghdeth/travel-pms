'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../utils/auth'
import { 
  Users, Building2, Calendar, DollarSign, TrendingUp, 
  BarChart3, PieChart, UserCheck, Settings, FileText,
  Shield, UserCog
} from 'lucide-react'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'

export default function AdminDashboard() {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Use fallback to sessionStorage if AuthContext user is null
  const user = authUser || auth.getUser()

  useEffect(() => {
    const checkAuth = () => {
      const sessionUser = auth.getUser()
      const sessionToken = auth.getToken()
      const isAuthenticated = authUser || (sessionToken && sessionUser)
      
      console.log('🔍 [AdminDashboard] User:', sessionUser)
      console.log('🔍 [AdminDashboard] Role:', sessionUser?.role)
      console.log('🔍 [AdminDashboard] Is authenticated:', isAuthenticated)
      
      if (!isAuthenticated) {
        console.log('🔍 [AdminDashboard] Not authenticated, redirecting to login')
        router.push('/login')
        return
      }
      
      // Check if user is actually an admin
      const isAdmin = sessionUser?.role === 'Hotel Admin' || authUser?.role === 'Hotel Admin'
      if (!isAdmin) {
        console.log('🔍 [AdminDashboard] Not admin, redirecting to staff dashboard')
        router.push('/staff-dashboard')
        return
      }
      
      setLoading(false)
    }
    
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [authUser, user, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-area flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading admin dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content-area">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName || 'Admin'}! Manage your hotel operations.
              </p>
            </div>
          </div>
        </div>

        {/* Admin KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$45,650</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5% from last week
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
                <p className="text-sm text-yellow-600 flex items-center mt-2">
                  <Users className="w-4 h-4 mr-1" />
                  Active employees
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
                <p className="text-sm text-purple-600 flex items-center mt-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  This month
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Staff Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                  Staff Management
                </h2>
                <button 
                  onClick={() => router.push('/staff')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Active Staff Members</p>
                    <p className="text-sm text-gray-600">24 employees currently active</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">24</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Departments</p>
                    <p className="text-sm text-gray-600">Front Desk, Kitchen, Housekeeping</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Operations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-green-600" />
                Hotel Operations
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Rooms Available</p>
                    <p className="text-sm text-gray-600">Ready for check-in</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">42</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Requests</p>
                    <p className="text-sm text-gray-600">Pending resolution</p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-purple-600" />
            Admin Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button 
              onClick={() => router.push('/staff')}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <UserCog className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Staff</span>
            </button>
            
            <button 
              onClick={() => router.push('/rooms')}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Building2 className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Room Management</span>
            </button>
            
            <button 
              onClick={() => router.push('/bookings')}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Bookings</span>
            </button>
            
            <button 
              onClick={() => router.push('/analytics')}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Analytics</span>
            </button>
            
            <button 
              onClick={() => router.push('/reports')}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <FileText className="w-8 h-8 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Reports</span>
            </button>
            
            <button 
              onClick={() => router.push('/settings')}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}