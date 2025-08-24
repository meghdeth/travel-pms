'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Filter, Users, User, UserCheck, UserX, AlertTriangle, Edit, Trash2, Mail, Phone } from 'lucide-react'
import DataTable, { Column } from '../../components/ui/DataTable'
import StaffCard from '../../components/ui/StaffCard'
import { hotelApiService, StaffMember, StaffStatistics, UpdateStaffMemberData } from '../../services/hotelApiService'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../utils/auth'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import AddStaffModal from '../../components/AddStaffModal'
import { ROLE_OPTIONS, STATUS_OPTIONS, STATUS_COLORS, getRoleColor, getRoleIcon } from '../../constants/roles'

const RoleIcon = ({ role }: { role: StaffMember['role'] }) => {
  const IconComponent = getRoleIcon(role)
  return <IconComponent className="w-4 h-4" />
}

const StatusIcon = ({ status }: { status: StaffMember['status'] }) => {
  switch (status) {
    case 'active':
      return <UserCheck className="w-4 h-4" />
    case 'suspended':
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <UserX className="w-4 h-4" />
  }
}

export default function StaffManagement() {
  const { user: authUser, hotel } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [statistics, setStatistics] = useState<StaffStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Use fallback to sessionStorage if AuthContext user is null
  const user = authUser || auth.getUser()

  // Authentication and data loading
  useEffect(() => {
    const checkAuthAndLoad = () => {
      // Debug authentication state
      const sessionUser = auth.getUser()
      const sessionToken = auth.getToken()
      const sessionHotelId = auth.getHotelId()
      
      console.log('🔍 [StaffPage] AuthContext user:', authUser)
      console.log('🔍 [StaffPage] SessionStorage user:', sessionUser)
      console.log('🔍 [StaffPage] Final user:', user)
      console.log('🔍 [StaffPage] Token exists:', sessionToken ? 'EXISTS' : 'MISSING')
      console.log('🔍 [StaffPage] Hotel ID:', sessionHotelId)
      console.log('🔍 [StaffPage] User role:', user?.role)
      
      // Check if user is authenticated
      const isAuthenticated = authUser || (sessionToken && sessionUser)
      if (!isAuthenticated) {
        console.log('🔍 [StaffPage] Not authenticated, redirecting to login')
        router.push('/login')
        return
      }
      
      // Check if user is admin (only admins can access staff management)
      const isAdmin = user?.role === 'Hotel Admin'
      if (!isAdmin) {
        console.log('🔍 [StaffPage] Not admin, redirecting to staff dashboard')
        router.push('/staffdashboard')
        return
      }
      
      // Load staff data using stored auth/hotel information
      loadStaffData()
    }
    
    // Add small delay to ensure sessionStorage is ready
    const timer = setTimeout(checkAuthAndLoad, 100)
    return () => clearTimeout(timer)
  }, [user, authUser, router])

  // NOTE: testLogin removed to prevent automatic dev login that can mask real auth issues.

  const loadStaffDataWithHotelId = async (testHotelId: string) => {
    console.log('🔍 [loadStaffDataWithHotelId] Loading data for hotel ID:', testHotelId)
    console.log('🔍 [loadStaffDataWithHotelId] Current token:', auth.getToken() ? 'EXISTS' : 'MISSING')
    console.log('🔍 [loadStaffDataWithHotelId] User data:', auth.getUser())

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 [loadStaffDataWithHotelId] Making API calls...')
      
      // Load both staff members and statistics
      const [staffResponse, statsResponse] = await Promise.all([
        hotelApiService.getStaffMembers(testHotelId),
        hotelApiService.getStaffStatistics(testHotelId)
      ])
      
      console.log('🔍 [loadStaffDataWithHotelId] Staff response:', staffResponse)
      console.log('🔍 [loadStaffDataWithHotelId] Stats response:', statsResponse)
      
      if (staffResponse) {
        setStaff(staffResponse)
      }
      
      if (statsResponse) {
        setStatistics(statsResponse)
      }
    } catch (error: any) {
      console.error('🔍 [loadStaffDataWithHotelId] Error loading staff data:', error)
      console.error('🔍 [loadStaffDataWithHotelId] Error response:', error.response?.data)
      console.error('🔍 [loadStaffDataWithHotelId] Error status:', error.response?.status)
      setError(`Failed to load staff data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStaffData = async () => {
    let hotelId = auth.getHotelId()
    
    // Fallback: try to get hotel ID from user data
    if (!hotelId) {
      const userData = auth.getUser()
      hotelId = userData?.hotelId || userData?.hotel_id
      console.log('🔍 [loadStaffData] Using fallback hotel ID from user data:', hotelId)
    }
    
    if (!hotelId) {
      console.error('🔍 [loadStaffData] No hotel ID available after all attempts')
      setError('Authentication required. Please log in again.')
      setLoading(false)
      return
    }
    
    console.log('🔍 [loadStaffData] Loading data for hotel ID:', hotelId)

    try {
      setLoading(true)
      setError(null)
      
      // Load both staff members and statistics
      const [staffResponse, statsResponse] = await Promise.all([
        hotelApiService.getStaffMembers(hotelId),
        hotelApiService.getStaffStatistics(hotelId)
      ])
      
      console.log('🔍 [loadStaffData] Staff response:', staffResponse)
      console.log('🔍 [loadStaffData] Stats response:', statsResponse)
      
      if (staffResponse) {
        setStaff(staffResponse)
      }
      
      if (statsResponse) {
        setStatistics(statsResponse)
      }
    } catch (error: any) {
      console.error('🔍 [loadStaffData] Error loading staff data:', error)
      console.error('🔍 [loadStaffData] Error response:', error.response?.data)
      console.error('🔍 [loadStaffData] Error status:', error.response?.status)
      
      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setError('Session expired. Please refresh the page or log in again.')
      } else {
        setError(`Failed to load staff data: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async (staffData: any) => {
    let hotelId = auth.getHotelId()
    if (!hotelId) {
      const userData = auth.getUser()
      hotelId = userData?.hotelId || userData?.hotel_id
    }
    if (!hotelId) return
    
    try {
      await hotelApiService.createStaffMember(hotelId, staffData)
      await loadStaffData() // Reload data
      setShowAddModal(false)
    } catch (err) {
      console.error('Error creating staff member:', err)
      setError('Failed to create staff member. Please try again.')
    }
  }

  const handleUpdateStaffStatus = async (staffId: string, status: 'active' | 'inactive' | 'suspended') => {
    const hotelId = auth.getHotelId()
    if (!hotelId) return
    
    try {
      await hotelApiService.updateStaffStatus(hotelId, staffId, status)
      await loadStaffData() // Reload data
    } catch (err) {
      console.error('Error updating staff status:', err)
      setError('Failed to update staff status. Please try again.')
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return
    
    const hotelId = auth.getHotelId()
    if (!hotelId) return
    
    try {
      await hotelApiService.deleteStaffMember(hotelId, staffId)
      await loadStaffData() // Reload data
    } catch (err) {
      console.error('Error deleting staff member:', err)
      setError('Failed to delete staff member. Please try again.')
    }
  }

  // Filter staff based on search and filters
  const filteredStaff = staff.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Define table columns
  const staffColumns: Column<StaffMember>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      render: (member) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {member.first_name} {member.last_name}
            </div>
            <div className="text-sm text-gray-500">
              ID: {member.hotel_user_id}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (member) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
          <RoleIcon role={member.role} />
          <span className="ml-1">{member.role}</span>
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status', 
      render: (member) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
          <StatusIcon status={member.status} />
          <span className="ml-1 capitalize">{member.status}</span>
        </span>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (member) => (
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-900">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (member) => (
        <span className="text-sm text-gray-500">
          {member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleUpdateStaffStatus(
              member.hotel_user_id, 
              member.status === 'active' ? 'inactive' : 'active'
            )}
            className={`p-1 rounded ${
              member.status === 'active' 
                ? 'text-red-600 hover:text-red-900' 
                : 'text-green-600 hover:text-green-900'
            }`}
            title={member.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {member.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleDeleteStaff(member.hotel_user_id)}
            className="text-red-600 hover:text-red-900 p-1 rounded"
            title="Delete staff member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading staff data...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    const isAuthError = error.includes('Session expired') || error.includes('Authentication required')
    
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {isAuthError ? (
              <>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Refresh Page
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Go to Login
                </button>
              </>
            ) : (
              <button 
                onClick={loadStaffData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content-area">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your hotel staff members and their roles</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{statistics?.totalStaff || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{statistics?.activeStaff || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics?.inactiveStaff || 0}</p>
              </div>
              <UserX className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{statistics?.suspendedStaff || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ROLE_OPTIONS.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-4 flex justify-end">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Card View
            </button>
          </div>
        </div>

        {/* Staff Data Display */}
        {viewMode === 'table' ? (
          <DataTable
            data={filteredStaff}
            columns={staffColumns}
            loading={loading}
            emptyMessage="Try adjusting your search or filters"
            emptyIcon={<Users className="mx-auto h-12 w-12 text-gray-400" />}
          />
        ) : (
          <div className={filteredStaff.length > 0 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            {filteredStaff.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">No staff members found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredStaff.map((member) => (
                <StaffCard
                  key={member.hotel_user_id}
                  staff={member}
                  onToggleStatus={(staffId, currentStatus) => 
                    handleUpdateStaffStatus(staffId, currentStatus === 'active' ? 'inactive' : 'active')
                  }
                  onDelete={handleDeleteStaff}
                  showActions={true}
                />
              ))
            )}
          </div>
        )}

        <AddStaffModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateStaff}
          currentUserRole={user?.role || ''}
        />


      </div>
    </DashboardLayout>
  )
}