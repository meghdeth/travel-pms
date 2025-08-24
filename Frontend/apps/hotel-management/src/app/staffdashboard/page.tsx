'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../utils/auth'
import { 
  Calendar, Clock, CheckCircle, AlertTriangle, 
  Bed, Users, MessageSquare, FileText,
  User, Briefcase, Settings
} from 'lucide-react'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'

export default function StaffDashboard() {
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
      
      console.log('🔍 [StaffDashboard] User:', sessionUser)
      console.log('🔍 [StaffDashboard] Role:', sessionUser?.role)
      console.log('🔍 [StaffDashboard] Is authenticated:', isAuthenticated)
      
      if (!isAuthenticated) {
        console.log('🔍 [StaffDashboard] Not authenticated, redirecting to staff login')
        router.push('/staff/login')
        return
      }
      
      // Check if user is actually staff (not admin)
      const isStaff = sessionUser?.role !== 'Hotel Admin' && sessionUser?.role !== undefined
      if (!isStaff) {
        console.log('🔍 [StaffDashboard] Is admin, redirecting to admin dashboard')
        router.push('/admin-dashboard')
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
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading staff dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Manager':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Front Desk':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Finance Department':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Kitchen':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Manager':
        return <Briefcase className="w-5 h-5" />
      case 'Front Desk':
        return <Users className="w-5 h-5" />
      case 'Finance Department':
        return <FileText className="w-5 h-5" />
      case 'Kitchen':
        return <User className="w-5 h-5" />
      case 'Maintenance':
        return <Settings className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content-area">
        {/* Staff Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg border ${getRoleColor(user?.role || '')}`}>
              {getRoleIcon(user?.role || '')}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName || 'Staff'}! ({user?.role || 'Staff Member'})
              </p>
            </div>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Shift</p>
                <p className="text-xl font-bold text-gray-900">8:00 AM - 6:00 PM</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  Active shift
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Today</p>
                <p className="text-xl font-bold text-gray-900">8</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  6 completed
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Items</p>
                <p className="text-xl font-bold text-gray-900">3</p>
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-xl font-bold text-gray-900">2</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Unread
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Role-Specific Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Today's Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Today's Tasks
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {user?.role === 'Front Desk' && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-gray-900">Check-in guests (Room 101-105)</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-sm font-medium text-gray-900">Process checkout for Room 203</span>
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-900">Update room availability</span>
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                    </div>
                  </>
                )}

                {user?.role === 'Manager' && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-gray-900">Weekly staff meeting</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-sm font-medium text-gray-900">Review budget reports</span>
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-900">Approve overtime requests</span>
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                    </div>
                  </>
                )}

                {(user?.role === 'Kitchen' || user?.role === 'Maintenance') && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-gray-900">Complete morning duties</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-sm font-medium text-gray-900">Equipment maintenance check</span>
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-900">Inventory count</span>
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {user?.role === 'Front Desk' && (
                  <>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Users className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Check-in Guest</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors">
                      <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Check-out</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <Bed className="w-6 h-6 text-purple-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Room Status</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                      <MessageSquare className="w-6 h-6 text-yellow-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Guest Messages</span>
                    </button>
                  </>
                )}

                {user?.role === 'Manager' && (
                  <>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Reports</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Users className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Staff Schedule</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Bookings</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                      <Settings className="w-6 h-6 text-yellow-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Settings</span>
                    </button>
                  </>
                )}

                {(user?.role === 'Kitchen' || user?.role === 'Finance Department' || user?.role === 'Maintenance') && (
                  <>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <CheckCircle className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">My Tasks</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors">
                      <MessageSquare className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Messages</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <Clock className="w-6 h-6 text-purple-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Time Tracking</span>
                    </button>
                    <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                      <FileText className="w-6 h-6 text-yellow-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Reports</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-600" />
            Staff Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(user?.role || '')}`}>
                {user?.role || 'Staff Member'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Employee ID</div>
              <div className="text-lg font-bold text-gray-900">{user?.id || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Department</div>
              <div className="text-lg font-bold text-gray-900">{user?.role || 'General'}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}