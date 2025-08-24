'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Wifi, WifiOff, Settings, RefreshCw, AlertCircle, CheckCircle, Plus } from 'lucide-react'

interface OTAConnection {
  id: string
  name: string
  logo: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  bookings: number
  revenue: number
  commission: number
}

const otaConnections: OTAConnection[] = [
  {
    id: 'booking',
    name: 'Booking.com',
    logo: '/ota-booking.png',
    status: 'connected',
    lastSync: '2024-01-15 10:30 AM',
    bookings: 45,
    revenue: 12450,
    commission: 15
  },
  {
    id: 'expedia',
    name: 'Expedia',
    logo: '/ota-expedia.png',
    status: 'connected',
    lastSync: '2024-01-15 10:25 AM',
    bookings: 32,
    revenue: 8900,
    commission: 18
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    logo: '/ota-airbnb.png',
    status: 'error',
    lastSync: '2024-01-14 3:45 PM',
    bookings: 0,
    revenue: 0,
    commission: 12
  },
  {
    id: 'agoda',
    name: 'Agoda',
    logo: '/ota-agoda.png',
    status: 'disconnected',
    lastSync: 'Never',
    bookings: 0,
    revenue: 0,
    commission: 16
  }
]

const StatusBadge = ({ status }: { status: OTAConnection['status'] }) => {
  const config = {
    connected: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Connected' },
    disconnected: { color: 'bg-gray-100 text-gray-800', icon: WifiOff, text: 'Disconnected' },
    error: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Error' }
  }
  
  const { color, icon: Icon, text } = config[status]
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </div>
  )
}

export default function OTAPage() {
  const [selectedOTA, setSelectedOTA] = useState<string | null>(null)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OTA Connections</h1>
          <p className="text-gray-600 mt-1">Manage your online travel agency integrations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New OTA
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Wifi className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connected OTAs</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">77</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">OTA Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$21,350</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* OTA Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otaConnections.map((ota) => (
          <div key={ota.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">{ota.name.charAt(0)}</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{ota.name}</h3>
                    <StatusBadge status={ota.status} />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Sync:</span>
                  <span className="text-sm font-medium text-gray-900">{ota.lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings:</span>
                  <span className="text-sm font-medium text-gray-900">{ota.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-medium text-gray-900">${ota.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commission:</span>
                  <span className="text-sm font-medium text-gray-900">{ota.commission}%</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                {ota.status === 'connected' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync Now
                  </Button>
                )}
                {ota.status === 'disconnected' && (
                  <Button size="sm" className="flex-1">
                    <Wifi className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
                {ota.status === 'error' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Fix Issues
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent OTA Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New booking from Booking.com</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">+$245</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Inventory sync completed - Expedia</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Connection error - Airbnb</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Fix</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}