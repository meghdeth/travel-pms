'use client'

import React from 'react'
import { Users, UserCheck, UserX, Trash2, Mail, Phone, User } from 'lucide-react'
import { StaffMember } from '../../services/hotelApiService'
import { getRoleColor, getRoleIcon, STATUS_COLORS } from '../../constants/roles'

interface StaffTableProps {
  staff: StaffMember[]
  loading?: boolean
  currentUserRole?: string
  onUpdateStatus?: (staffId: string, status: 'active' | 'inactive' | 'suspended') => void
  onDeleteStaff?: (staffId: string) => void
  showActions?: boolean
}

const RoleIcon = ({ role }: { role: StaffMember['role'] }) => {
  const IconComponent = getRoleIcon(role)
  return <IconComponent className="w-4 h-4" />
}

const StatusIcon = ({ status }: { status: StaffMember['status'] }) => {
  switch (status) {
    case 'active':
      return <UserCheck className="w-4 h-4" />
    case 'suspended':
      return <UserX className="w-4 h-4" />
    default:
      return <UserX className="w-4 h-4" />
  }
}

export default function StaffTable({
  staff,
  loading = false,
  currentUserRole = '',
  onUpdateStatus,
  onDeleteStaff,
  showActions = true
}: StaffTableProps) {
  // For now, everyone can manage staff (permissions will be added later)
  const canManageStaff = true

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading staff data...</span>
        </div>
      </div>
    )
  }

  return (
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
              {(showActions && canManageStaff) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={showActions && canManageStaff ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No staff members found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              staff.map((member) => (
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
                      getRoleColor(member.role)
                    }`}>
                      <RoleIcon role={member.role} />
                      <span className="ml-1">{member.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
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
                    {member.phone && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  {(showActions && canManageStaff) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onUpdateStatus && (
                          <button
                            onClick={() => onUpdateStatus(
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
                        )}
                        {onDeleteStaff && (
                          <button
                            onClick={() => onDeleteStaff(member.hotel_user_id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete staff member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
  )
}