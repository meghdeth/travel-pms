'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Mail, Phone, User, Shield } from 'lucide-react'
import { StaffMember, UpdateStaffMemberData } from '../services/hotelApiService'

interface StaffEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (staffId: string, data: UpdateStaffMemberData) => Promise<void>
  staffMember: StaffMember | null
  currentUserRole: string
}

const StaffEditModal: React.FC<StaffEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staffMember,
  currentUserRole
}) => {
  const [formData, setFormData] = useState<UpdateStaffMemberData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Manager',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (staffMember) {
      setFormData({
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        status: staffMember.status
      })
    }
  }, [staffMember])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !staffMember) return

    setLoading(true)
    try {
      await onSave(staffMember.hotel_user_id, formData)
      onClose()
    } catch (error) {
      console.error('Error updating staff member:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateStaffMemberData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen || !staffMember) return null

  // Only Hotel Admins can edit staff
  const canEdit = currentUserRole === 'Hotel Admin'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {canEdit ? 'Edit Staff Member' : 'View Staff Member'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  } ${!canEdit ? 'bg-gray-50' : ''}`}
                  placeholder="Enter first name"
                />
              </div>
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  } ${!canEdit ? 'bg-gray-50' : ''}`}
                  placeholder="Enter last name"
                />
              </div>
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!canEdit}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } ${!canEdit ? 'bg-gray-50' : ''}`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!canEdit}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } ${!canEdit ? 'bg-gray-50' : ''}`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={formData.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value as StaffMember['role'])}
                disabled={!canEdit}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !canEdit ? 'bg-gray-50' : 'border-gray-300'
                }`}
              >
                <option value="Hotel Admin">Hotel Admin</option>
                <option value="Manager/Owner">Manager/Owner</option>
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
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || ''}
              onChange={(e) => handleInputChange('status', e.target.value as StaffMember['status'])}
              disabled={!canEdit}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !canEdit ? 'bg-gray-50' : 'border-gray-300'
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {canEdit ? 'Cancel' : 'Close'}
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffEditModal