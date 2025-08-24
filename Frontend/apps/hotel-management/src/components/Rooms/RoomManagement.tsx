'use client'

import React, { useState, useEffect } from 'react'
import { Button } from 'ui'
import { 
  Plus, Search, Filter, Edit, Trash2, RefreshCw, Calendar, 
  Bed, Users, DollarSign, Settings, AlertTriangle, CheckCircle,
  Clock, Wrench, Eye, MapPin, Star, Wifi, Car, Coffee,
  Tv, AirVent, Bath, Phone, Grid, List
} from 'lucide-react'
import { hotelApiService, Room, RoomType } from '../../services/hotelApiService'
import RoomModal from '../RoomModal'
import RoomAvailabilityCalendar from '../RoomAvailabilityCalendar'
import RoomPricingManager from '../RoomPricingManager'

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'pricing'>('grid')
  const [activeTab, setActiveTab] = useState<'rooms' | 'calendar' | 'pricing'>('rooms')

  const hotelId = 1 // This should come from context

  useEffect(() => {
    fetchRooms()
    fetchRoomTypes()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await hotelApiService.getRooms(hotelId)
      setRooms(data)
    } catch (err) {
      setError('Failed to fetch rooms')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomTypes = async () => {
    try {
      // Use the proper getRoomTypes method from hotelApiService
      const data = await hotelApiService.getRoomTypes(hotelId)
      setRoomTypes(data)
    } catch (err) {
      console.error('Failed to fetch room types:', err)
      // Fallback: extract unique room types from rooms data if getRoomTypes fails
      try {
        const roomsData = await hotelApiService.getRooms(hotelId)
        const uniqueRoomTypes = roomsData.reduce((acc: RoomType[], room) => {
          if (room.room_type && !acc.find(rt => rt.id === room.room_type?.id)) {
            // Create a proper RoomType object with all required properties
            const roomType: RoomType = {
              id: room.room_type.id,
              hotel_id: hotelId, // Use the hotelId from context
              name: room.room_type.name,
              description: room.room_type.description,
              max_occupancy: room.room_type.max_occupancy,
              base_price: room.room_type.base_price,
              status: 'active' // Default status since it's not in room.room_type
            }
            acc.push(roomType)
          }
          return acc
        }, [])
        setRoomTypes(uniqueRoomTypes)
      } catch (fallbackErr) {
        console.error('Failed to fetch room types via fallback:', fallbackErr)
      }
    }
  }

  const handleCreateRoom = async (roomData: any) => {
    try {
      await hotelApiService.createRoom(hotelId, roomData)
      await fetchRooms()
      setShowModal(false)
    } catch (err) {
      setError('Failed to create room')
      console.error(err)
    }
  }

  const handleUpdateRoom = async (roomData: any) => {
    if (!selectedRoom) return
    
    try {
      await hotelApiService.updateRoom(hotelId, selectedRoom.id, roomData)
      await fetchRooms()
      setShowModal(false)
      setSelectedRoom(null)
    } catch (err) {
      setError('Failed to update room')
      console.error(err)
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    
    try {
      await hotelApiService.deleteRoom(hotelId, roomId)
      await fetchRooms()
    } catch (err) {
      setError('Failed to delete room')
      console.error(err)
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_type?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesFloor = floorFilter === 'all' || room.floor_number?.toString() === floorFilter
    const matchesRoomType = roomTypeFilter === 'all' || room.room_type?.id?.toString() === roomTypeFilter
    return matchesSearch && matchesStatus && matchesFloor && matchesRoomType
  })

  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    outOfOrder: rooms.filter(r => r.status === 'out_of_order').length
  }

  const openEditModal = (room: Room) => {
    setSelectedRoom(room)
    setShowModal(true)
  }

  const openCreateModal = () => {
    setSelectedRoom(null)
    setShowModal(true)
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    out_of_order: 'bg-gray-100 text-gray-800'
  }

  const statusIcons = {
    available: CheckCircle,
    occupied: Users,
    maintenance: Wrench,
    out_of_order: AlertTriangle
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => fetchRooms()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button onClick={openCreateModal} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Room</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{roomStats.total}</p>
            </div>
            <Bed className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{roomStats.available}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{roomStats.occupied}</p>
            </div>
            <Users className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{roomStats.maintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Order</p>
              <p className="text-2xl font-bold text-gray-600">{roomStats.outOfOrder}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rooms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Availability Calendar
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pricing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pricing Management
          </button>
        </nav>
      </div>

      {/* Rooms Tab Content */}
      {activeTab === 'rooms' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out_of_order">Out of Order</option>
                </select>
                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Room Types</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id.toString()}>{type.name}</option>
                  ))}
                </select>
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${
                      viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${
                      viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Room Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room) => {
                const StatusIcon = statusIcons[room.status]
                return (
                  <div key={room.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Room {room.room_number}</h3>
                          <p className="text-sm text-gray-600">{room.room_type?.name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[room.status]}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {room.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Floor {room.floor_number || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Max {room.room_type?.max_occupancy || 'N/A'} guests
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          ${room.room_type?.base_price || 'N/A'}/night
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(room)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Floor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRooms.map((room) => {
                      const StatusIcon = statusIcons[room.status]
                      return (
                        <tr key={room.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Room {room.room_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{room.room_type?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{room.floor_number || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[room.status]}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {room.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{room.room_type?.max_occupancy || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${room.room_type?.base_price || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(room)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Calendar Tab Content */}
      {activeTab === 'calendar' && (
        <RoomAvailabilityCalendar />
      )}

      {/* Pricing Tab Content */}
      {activeTab === 'pricing' && (
        <RoomPricingManager />
      )}

      {/* Room Modal */}
      {showModal && (
        <RoomModal
          isOpen={showModal}
          room={selectedRoom}
          roomTypes={roomTypes}
          onSubmit={selectedRoom ? handleUpdateRoom : handleCreateRoom}
          onClose={() => {
            setShowModal(false)
            setSelectedRoom(null)
          }}
        />
      )}
    </div>
  )
}

export default RoomManagement