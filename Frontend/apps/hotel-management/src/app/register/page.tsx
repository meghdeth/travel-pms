'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Home, Building2, Users, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useRouter } from 'next/navigation'

type RegistrationType = 'single' | 'vendor' | null

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null)
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Hotel fields
    hotelName: '',
    hotelAddress: '',
    hotelCity: '',
    hotelState: '',
    hotelZip: '',
    hotelType: 'hotel', // hotel, hostel, bnb, dormitory, resort, motel
    // totalRooms: '1', // REMOVED - room management is separate module
    
    // Vendor hotel specific
    vendorId: '',
    
    // User details (simplified)
    firstName: '',
    lastName: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}
    
    if (currentStep === 1) {
      if (!registrationType) {
        newErrors.registrationType = 'Please select a registration type'
      }
    }
    
    if (currentStep === 2) {
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.password) newErrors.password = 'Password is required'
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      if (!formData.phone) newErrors.phone = 'Phone number is required'
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
    }
    
    if (currentStep === 3) {
      if (!formData.hotelName) newErrors.hotelName = 'Hotel name is required'
      if (!formData.hotelAddress) newErrors.hotelAddress = 'Address is required'
      if (!formData.hotelCity) newErrors.hotelCity = 'City is required'
      if (!formData.hotelState) newErrors.hotelState = 'State is required'
      // if (!formData.totalRooms) newErrors.totalRooms = 'Total rooms is required' // REMOVED
      
      if (registrationType === 'vendor' && !formData.vendorId) {
        newErrors.vendorId = 'Vendor ID is required for vendor hotel registration'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    
    setIsLoading(true)
    try {
      // Use hotelAuthService instead of direct fetch
      const registrationData = {
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        name: formData.hotelName,
        address: formData.hotelAddress,
        city: formData.hotelCity,
        state: formData.hotelState,
        zip_code: formData.hotelZip,
        hotel_type: formData.hotelType as 'hotel' | 'hostel' | 'bnb' | 'dormitory' | 'resort' | 'motel',
        // total_rooms: parseInt(formData.totalRooms) || 1, // REMOVED - will be set up in room management
        vendor_id: registrationType === 'vendor' ? formData.vendorId : undefined,
        first_name: formData.firstName,
        last_name: formData.lastName,
      }
      
      const result = await hotelAuthService.register(registrationData)
      
      // Registration successful, redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Home className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register Your Property
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join thousands of successful properties using our platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Type</span>
              <span>Details</span>
              <span>Property</span>
            </div>
          </div>

          {/* Step 1: Registration Type Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 text-center">
                Choose Registration Type
              </h3>
              
              <div className="space-y-4">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    registrationType === 'single' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRegistrationType('single')}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Single Hotel/Property</h4>
                      <p className="text-sm text-gray-600">
                        Register as an independent hotel, hostel, or accommodation
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    registrationType === 'vendor' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRegistrationType('vendor')}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Vendor Hotel</h4>
                      <p className="text-sm text-gray-600">
                        Register under an existing vendor (requires Vendor ID)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {errors.registrationType && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.registrationType}</span>
                </div>
              )}
              
              <Button 
                onClick={handleNext} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!registrationType}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 text-center">
                Account Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="First name"
                    />
                    {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Last name"
                    />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={handleBack} 
                  variant="outline" 
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Property Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 text-center">
                Property Information
              </h3>
              
              {registrationType === 'vendor' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Vendor Hotel Registration</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    You're registering under an existing vendor. Please provide your Vendor ID.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {registrationType === 'vendor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor ID *</label>
                    <input
                      type="text"
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your vendor ID"
                    />
                    {errors.vendorId && <p className="text-red-600 text-sm mt-1">{errors.vendorId}</p>}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Name</label>
                  <input
                    type="text"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Hotel/Property name"
                  />
                  {errors.hotelName && <p className="text-red-600 text-sm mt-1">{errors.hotelName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <select
                    name="hotelType"
                    value={formData.hotelType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="hostel">Hostel</option>
                    <option value="bnb">Bed & Breakfast</option>
                    <option value="dormitory">Dormitory</option>
                    <option value="resort">Resort</option>
                    <option value="motel">Motel</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="hotelAddress"
                    value={formData.hotelAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Street address"
                  />
                  {errors.hotelAddress && <p className="text-red-600 text-sm mt-1">{errors.hotelAddress}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="hotelCity"
                      value={formData.hotelCity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="City"
                    />
                    {errors.hotelCity && <p className="text-red-600 text-sm mt-1">{errors.hotelCity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="hotelState"
                      value={formData.hotelState}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="State"
                    />
                    {errors.hotelState && <p className="text-red-600 text-sm mt-1">{errors.hotelState}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    name="hotelZip"
                    value={formData.hotelZip}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="ZIP code"
                  />
                </div>
                
                {/* REMOVED Total Rooms field - room management is separate module */}
              </div>
              
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Registration Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  onClick={handleBack} 
                  variant="outline" 
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}