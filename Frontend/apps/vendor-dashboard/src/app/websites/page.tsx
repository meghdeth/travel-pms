'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Search, Plus, Globe, Settings, Eye, Edit, Trash2, ExternalLink, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Website {
  id: string
  name: string
  domain: string
  customDomain?: string
  status: 'active' | 'inactive' | 'pending'
  theme: string
  hotels: number
  visitors: number
  bookings: number
  revenue: number
  createdAt: string
  lastUpdated: string
}

const mockWebsites: Website[] = [
  {
    id: 'WS001',
    name: 'Luxury Hotels Collection',
    domain: 'luxury-hotels.travelpms.com',
    customDomain: 'www.luxuryhotels.com',
    status: 'active',
    theme: 'Elegant Dark',
    hotels: 5,
    visitors: 12500,
    bookings: 245,
    revenue: 45600,
    createdAt: '2023-12-01',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'WS002',
    name: 'Beach Resorts Portal',
    domain: 'beach-resorts.travelpms.com',
    status: 'active',
    theme: 'Ocean Blue',
    hotels: 3,
    visitors: 8900,
    bookings: 156,
    revenue: 28400,
    createdAt: '2023-11-15',
    lastUpdated: '2024-01-08'
  },
  {
    id: 'WS003',
    name: 'Mountain Lodge Network',
    domain: 'mountain-lodges.travelpms.com',
    status: 'pending',
    theme: 'Nature Green',
    hotels: 2,
    visitors: 0,
    bookings: 0,
    revenue: 0,
    createdAt: '2024-01-12',
    lastUpdated: '2024-01-12'
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
}

const StatusIcon = ({ status }: { status: Website['status'] }) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4" />
    case 'inactive':
      return <XCircle className="w-4 h-4" />
    case 'pending':
      return <AlertCircle className="w-4 h-4" />
  }
}

export default function WebsitesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredWebsites = mockWebsites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || website.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalStats = {
    websites: mockWebsites.length,
    activeWebsites: mockWebsites.filter(w => w.status === 'active').length,
    totalVisitors: mockWebsites.reduce((sum, w) => sum + w.visitors, 0),
    totalRevenue: mockWebsites.reduce((sum, w) => sum + w.revenue, 0)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">White Label Websites</h1>
          <p className="text-gray-600">Manage your branded booking websites</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Website
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Websites</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.websites}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sites</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.activeWebsites}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalVisitors.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-green-600">$</div>
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
                placeholder="Search websites..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWebsites.map((website) => (
          <div key={website.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{website.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[website.status]
                    }`}>
                      <StatusIcon status={website.status} />
                      {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Domain</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{website.domain}</p>
                    <Button variant="outline" size="sm">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {website.customDomain && (
                    <p className="text-xs text-blue-600">{website.customDomain}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hotels</p>
                    <p className="text-lg font-semibold text-gray-900">{website.hotels}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Theme</p>
                    <p className="text-sm font-medium text-gray-900">{website.theme}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600">Visitors</p>
                    <p className="text-sm font-semibold text-gray-900">{website.visitors.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Bookings</p>
                    <p className="text-sm font-semibold text-gray-900">{website.bookings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Revenue</p>
                    <p className="text-sm font-semibold text-gray-900">${website.revenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Updated {new Date(website.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWebsites.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No websites found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first white label website.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Website
          </Button>
        </div>
      )}
    </div>
  )
}