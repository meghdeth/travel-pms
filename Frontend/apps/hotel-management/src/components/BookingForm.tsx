'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { Calendar, Users, CreditCard, Save } from 'lucide-react'
import PricingCalculator, { PricingData, PricingBreakdown } from './PricingCalculator'
import { hotelApiService, CreateBookingData } from '../services/hotelApiService'

interface BookingFormProps {
  hotelId: number
  roomId?: number
  roomTypeId?: number
  accommodationType: 'hotel' | 'dormitory'
  baseRate: number
  onSubmit: (bookingData: CreateBookingData) => void
  onCancel: () => void
}

// Add proper type definitions
interface GuestDetails {
  first_name: string
  last_name: string
  email: string
  phone: string
}

interface FormData {
  guest_details: GuestDetails
  adults: number
  children: number
  check_in_date: string
  check_out_date: string
  special_requests: string
}

interface FormErrors {
  [key: string]: string | null
}

export default function BookingForm({
  hotelId,
  roomId,
  roomTypeId,
  accommodationType,
  baseRate,
  onSubmit,
  onCancel
}: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    guest_details: {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    },
    adults: 1,
    children: 0,
    check_in_date: '',
    check_out_date: '',
    special_requests: ''
  })

  const [pricing, setPricing] = useState<PricingData | null>(null)
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as object),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: null }))
    }
  }

  const handlePricingChange = (pricingData: PricingData, breakdown: PricingBreakdown) => {
    setPricing(pricingData)
    setPricingBreakdown(breakdown)
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.guest_details.first_name) newErrors['guest_details.first_name'] = 'First name is required'
    if (!formData.guest_details.last_name) newErrors['guest_details.last_name'] = 'Last name is required'
    if (!formData.guest_details.email) newErrors['guest_details.email'] = 'Email is required'
    if (!formData.guest_details.phone) newErrors['guest_details.phone'] = 'Phone is required'
    if (!formData.check_in_date) newErrors.check_in_date = 'Check-in date is required'
    if (!formData.check_out_date) newErrors.check_out_date = 'Check-out date is required'
    
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date)
      const checkOut = new Date(formData.check_out_date)
      if (checkOut <= checkIn) {
        newErrors.check_out_date = 'Check-out date must be after check-in date'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !pricing || !pricingBreakdown) {
      return
    }
    
    setLoading(true)
    
    try {
      const bookingData: CreateBookingData = {
        hotel_id: hotelId,
        room_id: roomId!,
        room_type_id: roomTypeId!,
        guest_details: formData.guest_details,
        adults: formData.adults,
        children: formData.children,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        pricing: {
          room_rate: pricing.base_rate,
          tax_amount: pricingBreakdown.tax_amount,
          service_charge: pricingBreakdown.service_charge_amount,
          total_amount: pricingBreakdown.total_amount,
          currency: pricing.currency
        },
        payment: {
          payment_method: 'credit_card',
          payment_status: 'pending'
        },
        special_requests: formData.special_requests
      }
      
      onSubmit(bookingData)
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalGuests = formData.adults + formData.children

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Booking</h2>
          <p className="text-gray-600 mt-1">
            {accommodationType === 'hotel' ? 'Hotel Room' : 'Dormitory Bed'} Booking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guest Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.guest_details.first_name}
                      onChange={(e) => handleInputChange('guest_details.first_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors['guest_details.first_name'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['guest_details.first_name'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['guest_details.first_name']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.guest_details.last_name}
                      onChange={(e) => handleInputChange('guest_details.last_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors['guest_details.last_name'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['guest_details.last_name'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['guest_details.last_name']}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.guest_details.email}
                      onChange={(e) => handleInputChange('guest_details.email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors['guest_details.email'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['guest_details.email'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['guest_details.email']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.guest_details.phone}
                      onChange={(e) => handleInputChange('guest_details.phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors['guest_details.phone'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['guest_details.phone'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['guest_details.phone']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => handleInputChange('check_in_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.check_in_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.check_in_date && (
                      <p className="text-red-500 text-xs mt-1">{errors.check_in_date}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => handleInputChange('check_out_date', e.target.value)}
                      min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.check_out_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.check_out_date && (
                      <p className="text-red-500 text-xs mt-1">{errors.check_out_date}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      Adults
                    </label>
                    <input
                      type="number"
                      value={formData.adults}
                      onChange={(e) => handleInputChange('adults', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Children
                    </label>
                    <input
                      type="number"
                      value={formData.children}
                      onChange={(e) => handleInputChange('children', parseInt(e.target.value) || 0)}
                      min="0"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={formData.special_requests}
                  onChange={(e) => handleInputChange('special_requests', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>

            {/* Pricing Calculator */}
            <div>
              <PricingCalculator
                accommodationType={accommodationType}
                baseRate={baseRate}
                checkInDate={formData.check_in_date}
                checkOutDate={formData.check_out_date}
                guests={totalGuests}
                onPricingChange={handlePricingChange}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !pricing || !pricingBreakdown}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Creating...' : 'Create Booking'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}