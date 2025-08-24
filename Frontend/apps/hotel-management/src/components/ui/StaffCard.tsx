'use client'

import React from 'react'
import { User, Mail, Phone, Shield, UserCheck, UserX, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { StaffMember } from '../../services/hotelApiService'

interface StaffCardProps {
  staff: StaffMember
  onEdit?: (staff: StaffMember) => void
  onDelete?: (staffId: string) => void
  onToggleStatus?: (staffId: string, currentStatus: StaffMember['status']) => void
  showActions?: boolean
  compact?: boolean
}

const getRoleColor = (role: string) => {
  const roleColors: Record<string, string> = {
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
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
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

export default function StaffCard({ 
  staff, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  showActions = true,
  compact = false 
}: StaffCardProps) {
  if (compact) {
    return (
      <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {staff.first_name} {staff.last_name}
              </div>
              <div className="text-sm text-gray-500">{staff.role}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
              <StatusIcon status={staff.status} />
              <span className="ml-1 capitalize">{staff.status}</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-16 w-16">
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {staff.first_name} {staff.last_name}
            </h3>
            <p className="text-sm text-gray-500 truncate">ID: {staff.hotel_user_id}</p>
            
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(staff.role)}`}>
                {staff.role === 'Hotel Admin' || staff.role === 'Manager' ? (
                  <Shield className="w-3 h-3 mr-1" />
                ) : (
                  <User className="w-3 h-3 mr-1" />
                )}
                {staff.role}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                <StatusIcon status={staff.status} />
                <span className="ml-1 capitalize">{staff.status}</span>
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(staff)}
                className="text-gray-600 hover:text-gray-900 p-1 rounded"
                title="Edit staff member"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(staff.hotel_user_id, staff.status)}
                className={`p-1 rounded ${
                  staff.status === 'active' 
                    ? 'text-red-600 hover:text-red-900' 
                    : 'text-green-600 hover:text-green-900'
                }`}
                title={staff.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                {staff.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(staff.hotel_user_id)}
                className="text-red-600 hover:text-red-900 p-1 rounded"
                title="Delete staff member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span>{staff.email}</span>
        </div>
        {staff.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{staff.phone}</span>
          </div>
        )}
        <div className="text-sm text-gray-500">
          Last login: {staff.last_login ? new Date(staff.last_login).toLocaleDateString() : 'Never'}
        </div>
      </div>
    </div>
  )
}