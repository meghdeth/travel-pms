'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Settings, Users, Shield, Eye, Edit, Save, X, Check } from 'lucide-react'

interface HotelPermissions {
  id: string
  hotelName: string
  permissions: {
    roomManagement: boolean
    bookingManagement: boolean
    guestServices: boolean
    analytics: boolean
    staffManagement: boolean
    paymentProcessing: boolean
    reporting: boolean
    whitelabeling: boolean
  }
  accessLevel: 'full' | 'limited' | 'view-only'
  status: 'active' | 'suspended'
}

const mockHotelPermissions: HotelPermissions[] = [
  {
    id: '1',
    hotelName: 'Grand Plaza Hotel',
    permissions: {
      roomManagement: true,
      bookingManagement: true,
      guestServices: true,
      analytics: true,
      staffManagement: false,
      paymentProcessing: true,
      reporting: true,
      whitelabeling: false
    },
    accessLevel: 'full',
    status: 'active'
  },
  {
    id: '2',
    hotelName: 'Seaside Resort',
    permissions: {
      roomManagement: true,
      bookingManagement: true,
      guestServices: false,
      analytics: false,
      staffManagement: false,
      paymentProcessing: false,
      reporting: true,
      whitelabeling: true
    },
    accessLevel: 'limited',
    status: 'active'
  }
]

export default function PermissionsPage() {
  const [hotelPermissions, setHotelPermissions] = useState<HotelPermissions[]>(mockHotelPermissions)
  const [editingHotel, setEditingHotel] = useState<string | null>(null)

  const handlePermissionToggle = (hotelId: string, permission: keyof HotelPermissions['permissions']) => {
    setHotelPermissions(prev => prev.map(hotel => 
      hotel.id === hotelId 
        ? { ...hotel, permissions: { ...hotel.permissions, [permission]: !hotel.permissions[permission] } }
        : hotel
    ))
  }

  const handleAccessLevelChange = (hotelId: string, level: HotelPermissions['accessLevel']) => {
    setHotelPermissions(prev => prev.map(hotel => 
      hotel.id === hotelId ? { ...hotel, accessLevel: level } : hotel
    ))
  }

  const handleStatusToggle = (hotelId: string) => {
    setHotelPermissions(prev => prev.map(hotel => 
      hotel.id === hotelId 
        ? { ...hotel, status: hotel.status === 'active' ? 'suspended' : 'active' }
        : hotel
    ))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Permissions</h1>
          <p className="text-gray-600 mt-1">Manage access control and permissions for hotels under your vendor account</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Bulk Permissions</span>
        </Button>
      </div>

      <div className="space-y-6">
        {hotelPermissions.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-semibold text-gray-900">{hotel.hotelName}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hotel.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hotel.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={hotel.accessLevel}
                    onChange={(e) => handleAccessLevelChange(hotel.id, e.target.value as HotelPermissions['accessLevel'])}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full">Full Access</option>
                    <option value="limited">Limited Access</option>
                    <option value="view-only">View Only</option>
                  </select>
                  <Button
                    variant={hotel.status === 'active' ? 'outline' : 'default'}
                    onClick={() => handleStatusToggle(hotel.id)}
                    className={hotel.status === 'suspended' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {hotel.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(hotel.permissions).map(([permission, enabled]) => (
                  <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {permission.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePermissionToggle(hotel.id, permission as keyof HotelPermissions['permissions'])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      disabled={hotel.status === 'suspended'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}