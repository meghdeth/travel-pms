'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { 
  Plus, Search, Filter, Edit, Trash2, RefreshCw, Calendar, 
  Bed, Users, DollarSign, Settings, AlertTriangle, CheckCircle,
  Clock, Wrench, Eye, MapPin, Star, Wifi, Car, Coffee,
  Tv, AirVent, Bath, Phone
} from 'lucide-react'
// Add import for EnhancedRoom type in RoomModal
import { hotelApiService, Room } from '../../services/hotelApiService'
import RoomModal from '../../components/RoomModal'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'

import { EnhancedRoom } from '../../types/room'

// Remove the EnhancedRoom interface definition from this file since it's now imported

const mockRooms: EnhancedRoom[] = [
  {
    id: '1',
    roomNumber: '101',
    roomType: {
      id: 'deluxe',
      name: 'Deluxe Room',
      basePrice: 150,
      maxOccupancy: 2,
      amenities: ['wifi', 'tv', 'ac', 'minibar']
    },
    floor: 1,
    status: 'occupied',
    currentGuest: {
      name: 'John Smith',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      guestCount: 2
    },
    lastCleaned: '2024-01-15T08:00:00Z',
    pricing: {
      baseRate: 150,
      currentRate: 165
    },
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony'],
    images: ['/rooms/101-1.jpg', '/rooms/101-2.jpg']
  },
  {
    id: '2',
    roomNumber: '102',
    roomType: {
      id: 'standard',
      name: 'Standard Room',
      basePrice: 100,
      maxOccupancy: 2,
      amenities: ['wifi', 'tv', 'ac']
    },
    floor: 1,
    status: 'available',
    lastCleaned: '2024-01-16T10:30:00Z',
    pricing: {
      baseRate: 100,
      currentRate: 110
    },
    amenities: ['wifi', 'tv', 'ac'],
    images: ['/rooms/102-1.jpg']
  },
  {
    id: '3',
    roomNumber: '201',
    roomType: {
      id: 'suite',
      name: 'Executive Suite',
      basePrice: 300,
      maxOccupancy: 4,
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'jacuzzi']
    },
    floor: 2,
    status: 'maintenance',
    lastCleaned: '2024-01-14T14:00:00Z',
    maintenanceNotes: 'AC unit needs repair',
    pricing: {
      baseRate: 300,
      currentRate: 320
    },
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'jacuzzi', 'balcony', 'kitchenette'],
    images: ['/rooms/201-1.jpg', '/rooms/201-2.jpg', '/rooms/201-3.jpg']
  },
  {
    id: '4',
    roomNumber: '202',
    roomType: {
      id: 'deluxe',
      name: 'Deluxe Room',
      basePrice: 150,
      maxOccupancy: 2,
      amenities: ['wifi', 'tv', 'ac', 'minibar']
    },
    floor: 2,
    status: 'cleaning',
    lastCleaned: '2024-01-16T12:00:00Z',
    pricing: {
      baseRate: 150,
      currentRate: 165
    },
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    images: ['/rooms/202-1.jpg']
  },
  {
    id: '5',
    roomNumber: '301',
    roomType: {
      id: 'standard',
      name: 'Standard Room',
      basePrice: 100,
      maxOccupancy: 2,
      amenities: ['wifi', 'tv', 'ac']
    },
    floor: 3,
    status: 'out-of-order',
    maintenanceNotes: 'Plumbing issue - room flooded',
    pricing: {
      baseRate: 100,
      currentRate: 110
    },
    amenities: ['wifi', 'tv', 'ac'],
    images: ['/rooms/301-1.jpg']
  }
]

const roomTypeColors = {
  'standard': 'bg-blue-100 text-blue-800',
  'deluxe': 'bg-purple-100 text-purple-800',
  'suite': 'bg-gold-100 text-gold-800'
}

const statusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  cleaning: 'bg-blue-100 text-blue-800',
  'out-of-order': 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  available: CheckCircle,
  occupied: Users,
  maintenance: Wrench,
  cleaning: Clock,
  'out-of-order': AlertTriangle
}

const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  minibar: Coffee,
  jacuzzi: Bath,
  balcony: MapPin,
  kitchenette: Coffee,
  parking: Car,
  phone: Phone
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<EnhancedRoom[]>(mockRooms)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<EnhancedRoom | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter
    const matchesRoomType = roomTypeFilter === 'all' || room.roomType.id === roomTypeFilter
    
    return matchesSearch && matchesStatus && matchesFloor && matchesRoomType
  })

  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    outOfOrder: rooms.filter(r => r.status === 'out-of-order').length
  }

  const handleRoomAction = (action: string, room: EnhancedRoom) => {
    switch (action) {
      case 'edit':
        setSelectedRoom(room)
        setShowModal(true)
        break
      case 'check-in':
        // Handle check-in logic
        console.log('Check-in for room:', room.roomNumber)
        break
      case 'check-out':
        // Handle check-out logic
        console.log('Check-out for room:', room.roomNumber)
        break
      case 'maintenance':
        // Handle maintenance request
        console.log('Maintenance request for room:', room.roomNumber)
        break
      case 'clean':
        // Handle cleaning request
        console.log('Cleaning request for room:', room.roomNumber)
        break
    }
  }

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null
  }

  const renderRoomCard = (room: EnhancedRoom) => (
    <div key={room.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Room Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[room.status]}`}>
              {getStatusIcon(room.status)}
              <span className="ml-1">{room.status}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRoomAction('edit', room)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRoomAction('maintenance', room)}
            >
              <Wrench className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Type and Floor */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${roomTypeColors[room.roomType.id as keyof typeof roomTypeColors] || 'bg-gray-100 text-gray-800'}`}>
            {room.roomType.name}
          </span>
          <span className="text-sm text-gray-500">Floor {room.floor}</span>
        </div>

        {/* Current Guest Info */}
        {room.currentGuest && (
          <div className="bg-blue-50 p-3 rounded-lg mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">{room.currentGuest.name}</p>
                <p className="text-sm text-blue-700">
                  {room.currentGuest.checkIn} - {room.currentGuest.checkOut}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">{room.currentGuest.guestCount} guests</p>
                <Button
                  size="sm"
                  onClick={() => handleRoomAction('check-out', room)}
                  className="mt-1"
                >
                  Check Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Notes */}
        {room.maintenanceNotes && (
          <div className="bg-yellow-50 p-3 rounded-lg mb-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">{room.maintenanceNotes}</p>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Current Rate</p>
            <p className="text-lg font-semibold text-gray-900">${room.pricing.currentRate}/night</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Max Occupancy</p>
            <p className="text-lg font-semibold text-gray-900">{room.roomType.maxOccupancy} guests</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-2">Amenities</p>
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 4).map((amenity) => {
              const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons]
              return (
                <span key={amenity} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                  {amenity}
                </span>
              )
            })}
            {room.amenities.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Last Cleaned */}
        {room.lastCleaned && (
          <div className="text-xs text-gray-500">
            Last cleaned: {new Date(room.lastCleaned).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          {room.status === 'available' && (
            <Button
              size="sm"
              onClick={() => handleRoomAction('check-in', room)}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-1" />
              Check In
            </Button>
          )}
          {room.status === 'cleaning' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRoomAction('clean', room)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Clean
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRoomAction('edit', room)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="dashboard-content-area">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-1">Manage your hotel rooms, availability, and maintenance</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setLoading(true)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-gray-900">{roomStats.total}</p>
            <p className="text-sm text-gray-500">Total Rooms</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-green-600">{roomStats.available}</p>
            <p className="text-sm text-gray-500">Available</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-red-600">{roomStats.occupied}</p>
            <p className="text-sm text-gray-500">Occupied</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-blue-600">{roomStats.cleaning}</p>
            <p className="text-sm text-gray-500">Cleaning</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-yellow-600">{roomStats.maintenance}</p>
            <p className="text-sm text-gray-500">Maintenance</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-gray-600">{roomStats.outOfOrder}</p>
            <p className="text-sm text-gray-500">Out of Order</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
                <option value="out-of-order">Out of Order</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Room Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading rooms...</span>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredRooms.map(renderRoomCard)}
          </div>
        )}

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rooms found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Room Modal */}
      {showModal && (
        <RoomModal
          isOpen={showModal}
          room={selectedRoom as Room | null}
          roomTypes={[]}  // You'll need to provide actual room types
          onClose={() => {
            setShowModal(false)
            setSelectedRoom(null)
          }}
          onSubmit={(roomData: any) => {  // Changed from onSave to onSubmit
            // Handle save logic
            console.log('Save room:', roomData)
            setShowModal(false)
            setSelectedRoom(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}