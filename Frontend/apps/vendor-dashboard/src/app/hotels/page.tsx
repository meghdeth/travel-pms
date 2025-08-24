'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { HotelCard } from '../../components/hotels/HotelCard'
import { AddHotelModal } from '../../components/hotels/AddHotelModal'

const mockHotels = [
  {
    id: 1,
    name: 'Grand Plaza Hotel',
    location: 'New York, NY',
    rooms: 45,
    occupancy: 78,
    revenue: '$12,450',
    status: 'active' as const,
    image: '/hotel-1.jpg'
  },
  {
    id: 2,
    name: 'Seaside Resort',
    location: 'Miami, FL',
    rooms: 32,
    occupancy: 92,
    revenue: '$18,200',
    status: 'active' as const,
    image: '/hotel-2.jpg'
  },
  {
    id: 3,
    name: 'Mountain View Lodge',
    location: 'Denver, CO',
    rooms: 28,
    occupancy: 65,
    revenue: '$8,900',
    status: 'maintenance' as const,
    image: '/hotel-3.jpg'
  }
]

export default function HotelsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotels</h1>
          <p className="text-gray-600 mt-1">Manage your hotel properties</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Hotel</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      <AddHotelModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  )
}