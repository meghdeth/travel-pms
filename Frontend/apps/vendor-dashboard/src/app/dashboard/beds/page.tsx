'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Plus, Edit, Trash2, Bed, Users, MapPin, X } from 'lucide-react'

interface BedSpace {
  id: string
  bedNumber: string
  dormitoryName: string
  floor: number
  gender: 'male' | 'female' | 'mixed'
  price: number
  status: 'available' | 'occupied' | 'maintenance'
  amenities: string[]
  hotelId: string
}

type FilterType = 'all' | 'available' | 'occupied' | 'maintenance' | 'male' | 'female' | 'mixed'

export default function BedManagement() {
  const [beds, setBeds] = useState<BedSpace[]>([
    {
      id: '1',
      bedNumber: 'A-01',
      dormitoryName: 'Backpacker Dorm A',
      floor: 1,
      gender: 'mixed',
      price: 25,
      status: 'available',
      amenities: ['locker', 'wifi', 'shared_bathroom'],
      hotelId: 'hostel1'
    },
    {
      id: '2',
      bedNumber: 'B-05',
      dormitoryName: 'Female Dorm B',
      floor: 2,
      gender: 'female',
      price: 30,
      status: 'occupied',
      amenities: ['locker', 'wifi', 'private_bathroom'],
      hotelId: 'hostel1'
    },
    {
      id: '3',
      bedNumber: 'C-12',
      dormitoryName: 'Male Dorm C',
      floor: 3,
      gender: 'male',
      price: 28,
      status: 'available',
      amenities: ['locker', 'wifi', 'shared_bathroom'],
      hotelId: 'hostel1'
    },
    {
      id: '4',
      bedNumber: 'A-08',
      dormitoryName: 'Backpacker Dorm A',
      floor: 1,
      gender: 'mixed',
      price: 25,
      status: 'maintenance',
      amenities: ['locker', 'wifi'],
      hotelId: 'hostel1'
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBed, setSelectedBed] = useState<BedSpace | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bedNumber: '',
    dormitoryName: '',
    floor: 1,
    gender: 'mixed' as 'male' | 'female' | 'mixed',
    price: 0,
    status: 'available' as 'available' | 'occupied' | 'maintenance',
    amenities: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableAmenities = [
    'locker', 'wifi', 'shared_bathroom', 'private_bathroom', 
    'air_conditioning', 'reading_light', 'power_outlet', 'towels',
    'linens', 'curtains', 'security_camera', 'common_area'
  ]

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-800'
      case 'female': return 'bg-pink-100 text-pink-800'
      case 'mixed': return 'bg-purple-100 text-purple-800'
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

  const getFilteredBeds = () => {
    return beds.filter(bed => {
      switch (activeFilter) {
        case 'available':
        case 'occupied':
        case 'maintenance':
          return bed.status === activeFilter
        case 'male':
        case 'female':
        case 'mixed':
          return bed.gender === activeFilter
        default:
          return true
      }
    })
  }

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'all') return beds.length
    return beds.filter(bed => 
      bed.status === filter || bed.gender === filter
    ).length
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.bedNumber.trim()) {
      newErrors.bedNumber = 'Bed number is required'
    }
    if (!formData.dormitoryName.trim()) {
      newErrors.dormitoryName = 'Dormitory name is required'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (formData.floor < 1) {
      newErrors.floor = 'Floor must be at least 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (selectedBed) {
      // Edit existing bed
      setBeds(beds.map(bed => 
        bed.id === selectedBed.id 
          ? { ...bed, ...formData }
          : bed
      ))
    } else {
      // Add new bed
      const newBed: BedSpace = {
        id: Date.now().toString(),
        ...formData,
        hotelId: 'hostel1'
      }
      setBeds([...beds, newBed])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      bedNumber: '',
      dormitoryName: '',
      floor: 1,
      gender: 'mixed',
      price: 0,
      status: 'available',
      amenities: []
    })
    setErrors({})
    setSelectedBed(null)
    setShowAddModal(false)
  }

  const handleEdit = (bed: BedSpace) => {
    setSelectedBed(bed)
    setFormData({
      bedNumber: bed.bedNumber,
      dormitoryName: bed.dormitoryName,
      floor: bed.floor,
      gender: bed.gender,
      price: bed.price,
      status: bed.status,
      amenities: bed.amenities
    })
    setShowAddModal(true)
  }

  const handleDelete = (bedId: string) => {
    setBeds(beds.filter(bed => bed.id !== bedId))
    setShowDeleteConfirm(null)
  }

  const toggleAmenity = (amenity: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Bed Management</h1>
          <p className="text-gray-600 mt-1">Manage dormitory beds and hostel accommodations</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bed</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all' as FilterType, label: 'All Beds' },
          { key: 'available' as FilterType, label: 'Available' },
          { key: 'occupied' as FilterType, label: 'Occupied' },
          { key: 'maintenance' as FilterType, label: 'Maintenance' },
          { key: 'male' as FilterType, label: 'Male Only' },
          { key: 'female' as FilterType, label: 'Female Only' },
          { key: 'mixed' as FilterType, label: 'Mixed' }
        ].map(filter => (
          <Button 
            key={filter.key}
            variant={activeFilter === filter.key ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter.key)}
            className="flex items-center space-x-2"
          >
            <span>{filter.label}</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {getFilterCount(filter.key)}
            </span>
          </Button>
        ))}
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getFilteredBeds().map((bed) => (
          <div key={bed.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bed className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">{bed.bedNumber}</span>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(bed)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(bed.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{bed.dormitoryName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(bed.gender)}`}>
                  {bed.gender.charAt(0).toUpperCase() + bed.gender.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bed.status)}`}>
                  {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Floor {bed.floor}</span>
                <span className="font-semibold text-green-600">${bed.price}/night</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {bed.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {amenity.replace('_', ' ')}
                  </span>
                ))}
                {bed.amenities.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    +{bed.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredBeds().length === 0 && (
        <div className="text-center py-12">
          <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No beds found for the selected filter.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedBed ? 'Edit Bed' : 'Add New Bed'}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bed Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bedNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., A-01"
                  />
                  {errors.bedNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.bedNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dormitory Name *
                  </label>
                  <input
                    type="text"
                    value={formData.dormitoryName}
                    onChange={(e) => setFormData({...formData, dormitoryName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dormitoryName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Backpacker Dorm A"
                  />
                  {errors.dormitoryName && (
                    <p className="text-red-500 text-xs mt-1">{errors.dormitoryName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value) || 1})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.floor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.floor && (
                    <p className="text-red-500 text-xs mt-1">{errors.floor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender Type
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female' | 'mixed'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'available' | 'occupied' | 'maintenance'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {selectedBed ? 'Update Bed' : 'Add Bed'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this bed? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}