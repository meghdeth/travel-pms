'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { X, Plus, Minus } from 'lucide-react'
import { hotelApiService, Room } from '../services/hotelApiService'
import { PhotoUpload } from './PhotoUpload'
import { EnhancedRoom } from '../types/room'

interface RoomType {
  id: number
  name: string
  description?: string
  max_occupancy: number
  base_price: number
  amenities?: any
}

interface BedData {
  bed_number: string
  bed_type: 'single' | 'double' | 'queen' | 'king' | 'bunk'
  gender_restriction?: 'male' | 'female' | 'mixed'
  position?: 'window' | 'door' | 'corner' | 'center'
  floor_level?: 'bottom' | 'top'
  amenities: {
    has_locker: boolean
    locker_size?: 'small' | 'medium' | 'large'
    has_reading_light: boolean
    has_power_outlet: boolean
    has_curtains: boolean
    has_shelf: boolean
    includes_linens: boolean
    includes_towels: boolean
  }
  pricing: {
    base_price: number
    weekend_surcharge?: number
    holiday_surcharge?: number
    long_stay_discount?: number
    currency: string
  }
  min_stay_nights?: number
  max_stay_nights?: number
}

interface SharedFacilityData {
  facility_type: 'bathroom' | 'kitchen' | 'lounge' | 'laundry' | 'balcony' | 'terrace' | 'gym' | 'study_room' | 'game_room' | 'tv_room' | 'dining_area' | 'storage' | 'other'
  name: string
  description?: string
  location: string
  capacity?: number
  gender_restriction?: 'male' | 'female' | 'mixed'
  amenities: string[]
  requires_booking?: boolean
  max_booking_duration?: number
}

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (roomData: any) => void
  room?: Room | EnhancedRoom | null  // Accept both types
  roomTypes: RoomType[]
}

type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'out_of_order' | 'cleaning' | 'out-of-order'

// Helper function to get room properties safely
function getRoomProperty(room: Room | EnhancedRoom, property: string): any {
  if ('room_number' in room) {
    // It's a Room type
    const roomObj = room as Room
    switch (property) {
      case 'room_number': return roomObj.room_number
      case 'room_type_id': return roomObj.room_type_id
      case 'floor_number': return roomObj.floor_number
      case 'status': return roomObj.status
      case 'max_occupancy': return roomObj.max_occupancy
      case 'base_price': return roomObj.base_price
      default: return undefined
    }
  } else {
    // It's an EnhancedRoom type
    const enhancedRoom = room as EnhancedRoom
    switch (property) {
      case 'room_number': return enhancedRoom.roomNumber
      case 'room_type_id': return enhancedRoom.roomType.id
      case 'floor_number': return enhancedRoom.floor
      case 'status': return enhancedRoom.status === 'out-of-order' ? 'out_of_order' : enhancedRoom.status
      case 'max_occupancy': return enhancedRoom.roomType.maxOccupancy
      case 'base_price': return enhancedRoom.roomType.basePrice
      default: return undefined
    }
  }
}

export default function RoomModal({ isOpen, onClose, onSubmit, room, roomTypes }: RoomModalProps) {
  const [accommodationType, setAccommodationType] = useState<'hotel' | 'dormitory'>('hotel')
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    floor_number: '',
    status: 'available' as RoomStatus,
    notes: '',
    max_occupancy: 1,
    base_price: 0
  })
  
  const [beds, setBeds] = useState<BedData[]>([])
  const [sharedFacilities, setSharedFacilities] = useState<SharedFacilityData[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Add state for room type data if needed for photo upload
  const [roomTypeData, setRoomTypeData] = useState<{ images?: string[] } | null>(null)

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: getRoomProperty(room, 'room_number') || '',
        room_type_id: getRoomProperty(room, 'room_type_id')?.toString() || '',
        floor_number: getRoomProperty(room, 'floor_number')?.toString() || '',
        status: getRoomProperty(room, 'status') || 'available',
        notes: '',
        max_occupancy: getRoomProperty(room, 'max_occupancy') || 1,
        base_price: getRoomProperty(room, 'base_price') || 0
      })
    } else {
      setFormData({
        room_number: '',
        room_type_id: '',
        floor_number: '',
        status: 'available',
        notes: '',
        max_occupancy: 1,
        base_price: 0
      })
      setBeds([])
      setSharedFacilities([])
    }
    setErrors({})
  }, [room, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addBed = () => {
    const newBed: BedData = {
      bed_number: `BED-${beds.length + 1}`,
      bed_type: 'single',
      gender_restriction: 'mixed',
      amenities: {
        has_locker: true,
        locker_size: 'medium',
        has_reading_light: true,
        has_power_outlet: true,
        has_curtains: true,
        has_shelf: true,
        includes_linens: true,
        includes_towels: true
      },
      pricing: {
        base_price: 25,
        currency: 'USD'
      }
    }
    setBeds(prev => [...prev, newBed])
  }

  const removeBed = (index: number) => {
    setBeds(prev => prev.filter((_, i) => i !== index))
  }

  const updateBed = (index: number, field: string, value: any) => {
    setBeds(prev => prev.map((bed, i) => 
      i === index ? { ...bed, [field]: value } : bed
    ))
  }

  const updateBedAmenity = (bedIndex: number, amenity: string, value: any) => {
    setBeds(prev => prev.map((bed, i) => 
      i === bedIndex ? {
        ...bed,
        amenities: { ...bed.amenities, [amenity]: value }
      } : bed
    ))
  }

  const updateBedPricing = (bedIndex: number, field: string, value: any) => {
    setBeds(prev => prev.map((bed, i) => 
      i === bedIndex ? {
        ...bed,
        pricing: { ...bed.pricing, [field]: value }
      } : bed
    ))
  }

  const addSharedFacility = () => {
    const newFacility: SharedFacilityData = {
      facility_type: 'bathroom',
      name: '',
      location: '',
      amenities: [],
      gender_restriction: 'mixed'
    }
    setSharedFacilities(prev => [...prev, newFacility])
  }

  const removeSharedFacility = (index: number) => {
    setSharedFacilities(prev => prev.filter((_, i) => i !== index))
  }

  const updateSharedFacility = (index: number, field: string, value: any) => {
    setSharedFacilities(prev => prev.map((facility, i) => 
      i === index ? { ...facility, [field]: value } : facility
    ))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required'
    }
    if (!formData.room_type_id) {
      newErrors.room_type_id = 'Room type is required'
    }
    if (accommodationType === 'dormitory' && beds.length === 0) {
      newErrors.beds = 'At least one bed is required for dormitory rooms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      ...formData,
      room_type_id: parseInt(formData.room_type_id),
      floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
      accommodation_type: accommodationType,
      beds: accommodationType === 'dormitory' ? beds : undefined,
      shared_facilities: accommodationType === 'dormitory' ? sharedFacilities : undefined
    }

    onSubmit(submitData)  // Changed from onSave to onSubmit
  }

  if (!isOpen) return null

  // Replace the broken JSX at the end with proper integration:
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Accommodation Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodation Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hotel"
                  checked={accommodationType === 'hotel'}
                  onChange={(e) => setAccommodationType(e.target.value as 'hotel' | 'dormitory')}
                  className="mr-2"
                />
                Traditional Hotel Room
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="dormitory"
                  checked={accommodationType === 'dormitory'}
                  onChange={(e) => setAccommodationType(e.target.value as 'hotel' | 'dormitory')}
                  className="mr-2"
                />
                Dormitory/Hostel Room
              </label>
            </div>
          </div>

          {/* Basic Room Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                value={formData.room_number}
                onChange={(e) => handleInputChange('room_number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.room_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 101, A-1, Dorm-1"
              />
              {errors.room_number && (
                <p className="text-red-500 text-xs mt-1">{errors.room_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type *
              </label>
              <select
                value={formData.room_type_id}
                onChange={(e) => handleInputChange('room_type_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.room_type_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select room type</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - ${type.base_price}/night
                  </option>
                ))}
              </select>
              {errors.room_type_id && (
                <p className="text-red-500 text-xs mt-1">{errors.room_type_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Number
              </label>
              <input
                type="number"
                value={formData.floor_number}
                onChange={(e) => handleInputChange('floor_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2, 3"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_order">Out of Order</option>
              </select>
            </div>

            {accommodationType === 'hotel' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Occupancy
                  </label>
                  <input
                    type="number"
                    value={formData.max_occupancy}
                    onChange={(e) => handleInputChange('max_occupancy', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes about the room..."
            />
          </div>

          {/* Dormitory-specific sections */}
          {accommodationType === 'dormitory' && (
            <>
              {/* Beds Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Beds Management</h3>
                  <Button type="button" onClick={addBed} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Bed</span>
                  </Button>
                </div>
                
                {errors.beds && (
                  <p className="text-red-500 text-sm mb-4">{errors.beds}</p>
                )}

                <div className="space-y-4">
                  {beds.map((bed, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Bed {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeBed(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bed Number
                          </label>
                          <input
                            type="text"
                            value={bed.bed_number}
                            onChange={(e) => updateBed(index, 'bed_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bed Type
                          </label>
                          <select
                            value={bed.bed_type}
                            onChange={(e) => updateBed(index, 'bed_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="queen">Queen</option>
                            <option value="king">King</option>
                            <option value="bunk">Bunk</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender Restriction
                          </label>
                          <select
                            value={bed.gender_restriction || 'mixed'}
                            onChange={(e) => updateBed(index, 'gender_restriction', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="mixed">Mixed</option>
                            <option value="male">Male Only</option>
                            <option value="female">Female Only</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <select
                            value={bed.position || ''}
                            onChange={(e) => updateBed(index, 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select position</option>
                            <option value="window">Near Window</option>
                            <option value="door">Near Door</option>
                            <option value="corner">Corner</option>
                            <option value="center">Center</option>
                          </select>
                        </div>

                        {bed.bed_type === 'bunk' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Floor Level
                            </label>
                            <select
                              value={bed.floor_level || ''}
                              onChange={(e) => updateBed(index, 'floor_level', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select level</option>
                              <option value="bottom">Bottom Bunk</option>
                              <option value="top">Top Bunk</option>
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Price (USD)
                          </label>
                          <input
                            type="number"
                            value={bed.pricing.base_price}
                            onChange={(e) => updateBedPricing(index, 'base_price', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Bed Amenities */}
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Amenities</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(bed.amenities).map(([key, value]) => {
                            if (key === 'locker_size') return null
                            return (
                              <label key={key} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={value as boolean}
                                  onChange={(e) => updateBedAmenity(index, key, e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                  {key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                        
                        {bed.amenities.has_locker && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Locker Size
                            </label>
                            <select
                              value={bed.amenities.locker_size || 'medium'}
                              onChange={(e) => updateBedAmenity(index, 'locker_size', e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Facilities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Shared Facilities</h3>
                  <Button type="button" onClick={addSharedFacility} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Facility</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {sharedFacilities.map((facility, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Facility {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeSharedFacility(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Facility Type
                          </label>
                          <select
                            value={facility.facility_type}
                            onChange={(e) => updateSharedFacility(index, 'facility_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="bathroom">Bathroom</option>
                            <option value="kitchen">Kitchen</option>
                            <option value="lounge">Lounge</option>
                            <option value="laundry">Laundry</option>
                            <option value="balcony">Balcony</option>
                            <option value="terrace">Terrace</option>
                            <option value="gym">Gym</option>
                            <option value="study_room">Study Room</option>
                            <option value="game_room">Game Room</option>
                            <option value="tv_room">TV Room</option>
                            <option value="dining_area">Dining Area</option>
                            <option value="storage">Storage</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={facility.name}
                            onChange={(e) => updateSharedFacility(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Main Bathroom, Kitchen Area"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={facility.location}
                            onChange={(e) => updateSharedFacility(index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1st Floor, End of Hallway"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender Restriction
                          </label>
                          <select
                            value={facility.gender_restriction || 'mixed'}
                            onChange={(e) => updateSharedFacility(index, 'gender_restriction', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="mixed">Mixed</option>
                            <option value="male">Male Only</option>
                            <option value="female">Female Only</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity
                          </label>
                          <input
                            type="number"
                            value={facility.capacity || ''}
                            onChange={(e) => updateSharedFacility(index, 'capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Max people at once"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={facility.description || ''}
                          onChange={(e) => updateSharedFacility(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Describe the facility..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Photo Upload Section */}
          {formData.room_type_id && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type Images
              </label>
              <PhotoUpload
                entityType="room-type"
                entityId={formData.room_type_id}
                maxFiles={8}
                existingImages={roomTypeData?.images || []}
                onUploadSuccess={(images) => {
                  setRoomTypeData(prev => ({ ...prev, images }));
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {room ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}