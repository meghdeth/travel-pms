'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, Users, UserCheck, UserX, AlertTriangle, Shield, User, Edit, Trash2, Mail, Phone, Eye, EyeOff } from 'lucide-react'
import { hotelApiService, StaffMember, StaffStatistics, UpdateStaffMemberData, CreateStaffMemberData } from '../services/hotelApiService'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import StaffEditModal from './StaffEditModal'
import AddStaffModal from './AddStaffModal'

// Define role type for better type safety
type StaffRole = 'Hotel Admin' | 'Manager' | 'Finance Department' | 'Front Desk' | 'Booking Agent' | 'Gatekeeper' | 'Support' | 'Tech Support' | 'Service Boy' | 'Maintenance' | 'Kitchen'

// Enhanced role-based access control with proper typing
const getRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    'Hotel Admin': ['create_staff', 'edit_staff', 'delete_staff', 'view_all', 'manage_roles'],
    'Manager': ['view_staff', 'edit_limited', 'create_limited', 'view_reports'],
    'Finance Department': ['view_financial_staff', 'view_financial_reports'],
    'Front Desk': ['view_own_profile', 'view_guest_staff'],
    'Booking Agent': ['view_own_profile', 'view_booking_staff'],
    'Gatekeeper': ['view_own_profile'],
    'Support': ['view_own_profile', 'view_support_staff'],
    'Tech Support': ['view_own_profile', 'view_tech_staff'],
    'Service Boy': ['view_own_profile'],
    'Maintenance': ['view_own_profile'],
    'Kitchen': ['view_own_profile']
  }
  
  return permissions[role] || ['view_own_profile']
}

const canPerformAction = (currentUserRole: string, action: string, targetRole?: string) => {
  const permissions = getRolePermissions(currentUserRole)
  
  // Hotel Admin can do everything
  if (currentUserRole === 'Hotel Admin') {
    return true
  }
  
  // Manager can manage lower-level staff
  if (currentUserRole === 'Manager' && targetRole) {
    const hierarchy = [
      'Hotel Admin', 
      'Manager', 
      'Finance Department', 
      'Front Desk', 
      'Booking Agent',
      'Gatekeeper',
      'Support',
      'Tech Support',
      'Service Boy',
      'Maintenance',
      'Kitchen'
    ]
    const currentIndex = hierarchy.indexOf(currentUserRole)
    const targetIndex = hierarchy.indexOf(targetRole)
    return targetIndex > currentIndex
  }
  
  return permissions.includes(action)
}

// Role hierarchy for better organization with proper typing
const getRoleHierarchy = (): Record<string, string[]> => {
  return {
    'Management': ['Hotel Admin', 'Manager'],
    'Operations': ['Finance Department', 'Front Desk', 'Booking Agent'],
    'Support': ['Gatekeeper', 'Support', 'Tech Support'],
    'Service': ['Service Boy', 'Maintenance', 'Kitchen']
  }
}

const roleColors: Record<StaffRole, string> = {
  'Hotel Admin': 'bg-red-100 text-red-800 border-red-200',
  'Manager': 'bg-purple-100 text-purple-800 border-purple-200',
  'Finance Department': 'bg-green-100 text-green-800 border-green-200',
  'Front Desk': 'bg-blue-100 text-blue-800 border-blue-200',
  'Booking Agent': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Gatekeeper': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Support': 'bg-pink-100 text-pink-800 border-pink-200',
  'Tech Support': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Service Boy': 'bg-orange-100 text-orange-800 border-orange-200',
  'Maintenance': 'bg-gray-100 text-gray-800 border-gray-200',
  'Kitchen': 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-red-100 text-red-800 border-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const RoleIcon = ({ role }: { role: StaffMember['role'] }) => {
  const hierarchy = getRoleHierarchy()
  
  if (hierarchy.Management.includes(role)) {
    return <Shield className="w-4 h-4" />
  }
  
  return <User className="w-4 h-4" />
}

interface StaffManagementProps {
  currentUser: {
    role: string
    hotel_user_id?: string
    dev_hotel_user_id?: string
  }
  hotelId: string
}

export default function StaffManagement({ currentUser, hotelId }: StaffManagementProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [statistics, setStatistics] = useState<StaffStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null)
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false)

  // Load staff data
  const loadStaffData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [staffResponse, statsResponse] = await Promise.all([
        hotelApiService.getStaffMembers(hotelId),
        hotelApiService.getStaffStatistics(hotelId)
      ])
      
      // Handle API response structure - backend returns data directly
      setStaff(staffResponse || [])
      setStatistics(statsResponse || null)
    } catch (err: any) {
      console.error('Error loading staff data:', err)
      setError(err.message || 'Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hotelId) {
      loadStaffData()
    }
  }, [hotelId])

  // Handle staff creation
  const handleCreateStaff = async (data: CreateStaffMemberData) => {
    try {
      if (!canPerformAction(currentUser.role, 'create_staff')) {
        throw new Error('You do not have permission to create staff members')
      }
      
      await hotelApiService.createStaffMember(hotelId, data)
      await loadStaffData()
      setShowAddModal(false)
    } catch (err: any) {
      console.error('Error creating staff member:', err)
      throw err
    }
  }

  // Handle staff update
  const handleUpdateStaff = async (staffId: string, data: UpdateStaffMemberData) => {
    try {
      const targetStaff = staff.find(s => s.hotel_user_id === staffId)
      if (!canPerformAction(currentUser.role, 'edit_staff', targetStaff?.role)) {
        throw new Error('You do not have permission to edit this staff member')
      }
      
      await hotelApiService.updateStaffMember(hotelId, staffId, data)
      await loadStaffData()
      setShowEditModal(false)
      setSelectedStaffMember(null)
    } catch (err: any) {
      console.error('Error updating staff member:', err)
      throw err
    }
  }

  // Handle staff deletion
  const handleDeleteStaff = async (staffId: string) => {
    try {
      const targetStaff = staff.find(s => s.hotel_user_id === staffId)
      if (!canPerformAction(currentUser.role, 'delete_staff', targetStaff?.role)) {
        throw new Error('You do not have permission to delete this staff member')
      }
      
      if (window.confirm('Are you sure you want to delete this staff member?')) {
        await hotelApiService.deleteStaffMember(hotelId, staffId)
        await loadStaffData()
      }
    } catch (err: any) {
      console.error('Error deleting staff member:', err)
      setError(err.message || 'Failed to delete staff member')
    }
  }

  // Filter staff based on role-based access control
  const getVisibleStaff = () => {
    let visibleStaff = staff
    
    // Apply role-based filtering
    if (!canPerformAction(currentUser.role, 'view_all')) {
      // Non-admin users can only see certain staff members
      if (currentUser.role === 'Manager') {
        // Managers can see all except Hotel Admin
        visibleStaff = staff.filter(member => member.role !== 'Hotel Admin')
      } else if (currentUser.role === 'Finance Department') {
        // Finance can only see finance-related staff
        visibleStaff = staff.filter(member => 
          ['Finance Department', 'Manager'].includes(member.role)
        )
      } else {
        // Other roles can only see their own profile
        visibleStaff = staff.filter(member => 
          member.hotel_user_id === currentUser.hotel_user_id
        )
      }
    }
    
    return visibleStaff
  }

  // Apply search and filters
  const filteredStaff = getVisibleStaff().filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    
    // Category filter with proper typing
    let matchesCategory = true
    if (selectedCategory !== 'all') {
      const hierarchy = getRoleHierarchy()
      const categoryRoles = hierarchy[selectedCategory as keyof typeof hierarchy] || []
      matchesCategory = categoryRoles.includes(member.role)
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading staff data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button 
          onClick={loadStaffData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600">Manage your hotel staff and their roles</p>
        </div>
        {canPerformAction(currentUser.role, 'create_staff') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {statistics && canPerformAction(currentUser.role, 'view_all') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalStaff}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeStaff}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Staff</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.inactiveStaff}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roles</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.roleDistribution?.length || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-gray-300"
          >
            <option value="all">All Categories</option>
            <option value="Management">Management</option>
            <option value="Operations">Operations</option>
            <option value="Support">Support</option>
            <option value="Service">Service</option>
          </select>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          {canPerformAction(currentUser.role, 'view_all') && (
            <button
              onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSensitiveInfo ? 'Hide IDs' : 'Show IDs'}
            </button>
          )}
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600 mb-4">No staff members match your current filters.</p>
            {canPerformAction(currentUser.role, 'create_staff') && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  {showSensitiveInfo && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IDs</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.hotel_user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        roleColors[member.role]
                      }`}>
                        <RoleIcon role={member.role} />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        statusColors[member.status]
                      }`}>
                        {member.status === 'active' ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {showSensitiveInfo && (
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="space-y-1">
                          <div>ID: {member.hotel_user_id}</div>
                          <div>Hotel: {member.hotel_id}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {canPerformAction(currentUser.role, 'edit_staff', member.role) && (
                          <button
                            onClick={() => {
                              setSelectedStaffMember(member)
                              setShowEditModal(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Edit staff member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canPerformAction(currentUser.role, 'delete_staff', member.role) && (
                          <button
                            onClick={() => handleDeleteStaff(member.hotel_user_id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete staff member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStaffModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateStaff}
          currentUserRole={currentUser.role}
        />
      )}

      {showEditModal && selectedStaffMember && (
        <StaffEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStaffMember(null)
          }}
          onSave={(staffId, data) => handleUpdateStaff(staffId, data)}
          staffMember={selectedStaffMember}
          currentUserRole={currentUser.role}
        />
      )}
    </div>
  )
}