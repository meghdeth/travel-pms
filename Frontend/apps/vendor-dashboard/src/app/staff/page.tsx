'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Search, Plus, Users, Mail, Phone, MapPin, Edit, Trash2, UserCheck, UserX, Shield, User } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'manager' | 'receptionist' | 'housekeeping' | 'maintenance' | 'admin'
  hotel: string
  status: 'active' | 'inactive'
  joinDate: string
  lastLogin: string
  permissions: string[]
  avatar?: string
}

const mockStaff: StaffMember[] = [
  {
    id: 'STF001',
    name: 'Alice Johnson',
    email: 'alice.johnson@hotel.com',
    phone: '+1 (555) 123-4567',
    role: 'manager',
    hotel: 'Grand Plaza Hotel',
    status: 'active',
    joinDate: '2023-06-15',
    lastLogin: '2024-01-18T09:30:00Z',
    permissions: ['manage_bookings', 'manage_rooms', 'view_reports', 'manage_staff']
  },
  {
    id: 'STF002',
    name: 'Bob Smith',
    email: 'bob.smith@hotel.com',
    phone: '+1 (555) 234-5678',
    role: 'receptionist',
    hotel: 'Grand Plaza Hotel',
    status: 'active',
    joinDate: '2023-08-20',
    lastLogin: '2024-01-18T14:15:00Z',
    permissions: ['manage_bookings', 'check_in_out']
  },
  {
    id: 'STF003',
    name: 'Carol Davis',
    email: 'carol.davis@hotel.com',
    phone: '+1 (555) 345-6789',
    role: 'housekeeping',
    hotel: 'Seaside Resort',
    status: 'active',
    joinDate: '2023-09-10',
    lastLogin: '2024-01-17T16:45:00Z',
    permissions: ['manage_rooms', 'update_room_status']
  },
  {
    id: 'STF004',
    name: 'David Wilson',
    email: 'david.wilson@hotel.com',
    phone: '+1 (555) 456-7890',
    role: 'maintenance',
    hotel: 'Mountain View Lodge',
    status: 'inactive',
    joinDate: '2023-07-05',
    lastLogin: '2024-01-10T11:20:00Z',
    permissions: ['manage_maintenance', 'update_room_status']
  }
]

const roleColors = {
  manager: 'bg-purple-100 text-purple-800',
  receptionist: 'bg-blue-100 text-blue-800',
  housekeeping: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-red-100 text-red-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800'
}

const RoleIcon = ({ role }: { role: StaffMember['role'] }) => {
  switch (role) {
    case 'manager':
    case 'admin':
      return <Shield className="w-4 h-4" />
    default:
      return <User className="w-4 h-4" />
  }
}

const StatusIcon = ({ status }: { status: StaffMember['status'] }) => {
  return status === 'active' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />
}

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.hotel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalStats = {
    totalStaff: mockStaff.length,
    activeStaff: mockStaff.filter(s => s.status === 'active').length,
    managers: mockStaff.filter(s => s.role === 'manager').length,
    recentLogins: mockStaff.filter(s => {
      const lastLogin = new Date(s.lastLogin)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return lastLogin > yesterday
    }).length
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage your hotel staff and their permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalStaff}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.activeStaff}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.managers}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Logins</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.recentLogins}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search staff..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="maintenance">Maintenance</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-600">{staff.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    roleColors[staff.role]
                  }`}>
                    <RoleIcon role={staff.role} />
                    {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[staff.status]
                  }`}>
                    <StatusIcon status={staff.status} />
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{staff.hotel}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 mb-2">Permissions ({staff.permissions.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {staff.permissions.slice(0, 3).map((permission) => (
                      <span key={permission} className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {staff.permissions.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                        +{staff.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600">Joined</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(staff.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(staff.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first staff member.</p>
          <Button onClick={() => setShowAddModal(true)}>
            Add Staff Member
          </Button>
        </div>
      )}
    </div>
  )
}