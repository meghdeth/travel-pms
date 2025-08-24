'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Plus, Edit, Trash2, Bed, Users, Wifi, Car, Coffee, X } from 'lucide-react'

interface Room {
  id: string
  name: string
  type: 'suite' | 'executive' | 'basic'
  capacity: number
  price: number
  amenities: string[]
  status: 'available' | 'occupied' | 'maintenance'
  hotelId: string
}

interface RoomFormData {
  name: string
  type: 'suite' | 'executive' | 'basic'
  capacity: number
  price: number
  amenities: string[]
  status: 'available' | 'occupied' | 'maintenance'
  hotelId: string
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Presidential Suite 101',
      type: 'suite',
      capacity: 4,
      price: 500,
      amenities: ['wifi', 'parking', 'breakfast'],
      status: 'available',
      hotelId: 'hotel1'
    },
    {
      id: '2',
      name: 'Executive Room 201',
      type: 'executive',
      capacity: 2,
      price: 250,
      amenities: ['wifi', 'breakfast'],
      status: 'occupied',
      hotelId: 'hotel1'
    },
    {
      id: '3',
      name: 'Standard Room 301',
      type: 'basic',
      capacity: 2,
      price: 100,
      amenities: ['wifi'],
      status: 'available',
      hotelId: 'hotel1'
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    type: 'basic',
    capacity: 1,
    price: 0,
    amenities: [],
    status: 'available',
    hotelId: 'hotel1'
  })

  const availableAmenities = ['wifi', 'parking', 'breakfast', 'gym', 'pool', 'spa', 'restaurant']

  const filteredRooms = filterType === 'all' 
    ? rooms 
    : rooms.filter(room => room.type === filterType)

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'suite': return 'bg-purple-100 text-purple-800'
      case 'executive': return 'bg-blue-100 text-blue-800'
      case 'basic': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'occupied': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddRoom = () => {
    setSelectedRoom(null)
    setFormData({
      name: '',
      type: 'basic',
      capacity: 1,
      price: 0,
      amenities: [],
      status: 'available',
      hotelId: 'hotel1'
    })
    setShowModal(true)
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setFormData({
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      amenities: room.amenities,
      status: room.status,
      hotelId: room.hotelId
    })
    setShowModal(true)
  }

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(room => room.id !== roomId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedRoom) {
      // Edit existing room
      setRooms(rooms.map(room => 
        room.id === selectedRoom.id 
          ? { ...room, ...formData }
          : room
      ))
    } else {
      // Add new room
      const newRoom: Room = {
        id: Date.now().toString(),
        ...formData
      }
      setRooms([...rooms, newRoom])
    }
    
    setShowModal(false)
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage your hotel rooms and room types</p>
        </div>
        <Button 
          onClick={handleAddRoom}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </Button>
      </div>

      {/* Room Type Filters */}
      <div className="flex space-x-4 mb-6">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          All Rooms ({rooms.length})
        </Button>
        <Button 
          variant={filterType === 'suite' ? 'default' : 'outline'}
          onClick={() => setFilterType('suite')}
        >
          Suite ({rooms.filter(r => r.type === 'suite').length})
        </Button>
        <Button 
          variant={filterType === 'executive' ? 'default' : 'outline'}
          onClick={() => setFilterType('executive')}
        >
          Executive ({rooms.filter(r => r.type === 'executive').length})
        </Button>
        <Button 
          variant={filterType === 'basic' ? 'default' : 'outline'}
          onClick={() => setFilterType('basic')}
        >
          Basic ({rooms.filter(r => r.type === 'basic').length})
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditRoom(room)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(room.type)}`}>
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{room.capacity} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-green-600">${room.price}/night</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-1 text-xs text-gray-500">
                      {amenity === 'wifi' && <Wifi className="w-3 h-3" />}
                      {amenity === 'parking' && <Car className="w-3 h-3" />}
                      {amenity === 'breakfast' && <Coffee className="w-3 h-3" />}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic Room</option>
                  <option value="executive">Executive Suite</option>
                  <option value="suite">Presidential Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price/Night ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedRoom ? 'Update Room' : 'Add Room'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}