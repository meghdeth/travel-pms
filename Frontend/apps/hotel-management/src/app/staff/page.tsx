'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Filter, Users, UserCheck, UserX, AlertTriangle, Shield, User, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { hotelApiService, StaffMember, StaffStatistics, UpdateStaffMemberData } from '../../services/hotelApiService'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useAuth } from '../../contexts/AuthContext'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import AddStaffModal from '../../components/AddStaffModal'

const roleColors = {
  'Hotel Admin': 'bg-red-100 text-red-800',
  'Manager': 'bg-purple-100 text-purple-800',
  'Finance Department': 'bg-green-100 text-green-800',
  'Front Desk': 'bg-blue-100 text-blue-800',
  'Booking Agent': 'bg-indigo-100 text-indigo-800',
  'Gatekeeper': 'bg-yellow-100 text-yellow-800',
  'Support': 'bg-pink-100 text-pink-800',
  'Tech Support': 'bg-cyan-100 text-cyan-800',
  'Service Boy': 'bg-orange-100 text-orange-800',
  'Maintenance': 'bg-gray-100 text-gray-800',
  'Kitchen': 'bg-emerald-100 text-emerald-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  suspended: 'bg-yellow-100 text-yellow-800'
}

const RoleIcon = ({ role }: { role: StaffMember['role'] }) => {
  switch (role) {
    case 'Hotel Admin':
    case 'Manager':
      return <Shield className="w-4 h-4" />
    case 'Finance Department':
    case 'Front Desk':
    case 'Booking Agent':
      return <User className="w-4 h-4" />
    default:
      return <User className="w-4 h-4" />
  }
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
  const { user, hotel } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [statistics, setStatistics] = useState<StaffStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Authentication and data loading
  useEffect(() => {
    // Check authentication
    if (!user) {
      router.push('/login')
      return
    }

    // Check hotel ID
    const hotelId = hotelAuthService.getHotelId()
    if (!hotelId) {
      router.push('/login')
      return
    }

    loadStaffData()
  }, [user, router])

  const loadStaffData = async () => {
    const hotelId = hotelAuthService.getHotelId()
    if (!hotelId) {
      console.error('No hotel ID available')
      setError('Authentication required. Please log in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Load both staff members and statistics
      const [staffResponse, statsResponse] = await Promise.all([
        hotelApiService.getStaffMembers(hotelId),
        hotelApiService.getStaffStatistics(hotelId)
      ])
      
      if (staffResponse) {
        setStaff(staffResponse)
      }
      
      if (statsResponse) {
        setStatistics(statsResponse)
      }
    } catch (error: any) {
      console.error('Error loading staff data:', error)
      // Check if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setError('Session expired. Please refresh the page or log in again.')
      } else {
        setError('Failed to load staff data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async (staffData: any) => {
    const hotelId = hotelAuthService.getHotelId()
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
    const hotelId = hotelAuthService.getHotelId()
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
    
    const hotelId = hotelAuthService.getHotelId()
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
          {(user?.role === 'Hotel Admin' || user?.role === '1') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Staff Member
            </button>
          )}
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
                <option value="all">All Roles</option>
                <option value="Hotel Admin">Hotel Admin</option>
                <option value="Manager">Manager</option>
                <option value="Finance Department">Finance Department</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Booking Agent">Booking Agent</option>
                <option value="Gatekeeper">Gatekeeper</option>
                <option value="Support">Support</option>
                <option value="Tech Support">Tech Support</option>
                <option value="Service Boy">Service Boy</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Kitchen">Kitchen</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  {(user?.role === 'Hotel Admin' || user?.role === '1') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No staff members found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.hotel_user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          roleColors[member.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                          <RoleIcon role={member.role} />
                          <span className="ml-1">{member.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[member.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                          <StatusIcon status={member.status} />
                          <span className="ml-1 capitalize">{member.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{member.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      {(user?.role === 'Hotel Admin' || user?.role === '1') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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