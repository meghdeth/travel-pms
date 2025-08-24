'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { Calendar, ChevronLeft, ChevronRight, Filter, Search, Eye, Edit, Trash2, Plus } from 'lucide-react'
import { bookingService, BookingData, BookingFilters } from '../../../services/bookingService'

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  roomNumber?: string
  bedNumber?: string
  roomType?: 'suite' | 'executive_suite' | 'basic'
  bedType?: 'male' | 'female' | 'mixed'
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out'
  totalAmount: number
  paymentStatus: 'paid' | 'pending' | 'refunded'
  bookingType: 'room' | 'bed'
  specialRequests?: string
  createdAt: string
}

type FilterType = 'all' | 'room' | 'bed' | 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out'
type ViewType = 'calendar' | 'list'

export default function BookingCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [viewType, setViewType] = useState<ViewType>('calendar')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Get hotel ID from localStorage or context
  const getHotelId = () => {
    // This should come from your auth context or localStorage
    // For now, using a default value
    return "1"  // Change from 1 to "1" (string)
  }
  
  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const hotelId = getHotelId()
      const filters: BookingFilters = {}
      
      // Apply filters
      if (activeFilter !== 'all') {
        if (activeFilter === 'room' || activeFilter === 'bed') {
          filters.bookingType = activeFilter  // Change from booking_type to bookingType
        } else {
          filters.status = activeFilter
        }
      }
      
      const data = await bookingService.getBookings(hotelId, filters)
      
      // Transform API data to match component interface
      const transformedBookings: Booking[] = data.map((booking: any) => ({  // Add type annotation
        id: booking.id,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomNumber: booking.roomNumber,
        bedNumber: booking.bedNumber,
        roomType: booking.roomType,
        bedType: booking.bedType,
        status: booking.status,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        bookingType: booking.bookingType,
        specialRequests: booking.specialRequests,
        createdAt: booking.createdAt
      }))
      
      setBookings(transformedBookings)
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.')
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load bookings on component mount and filter change
  useEffect(() => {
    fetchBookings()
  }, [activeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'checked_in': return 'bg-blue-100 text-blue-800'
      case 'checked_out': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFilteredBookings = () => {
    let filtered = bookings

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'all') return bookings.length
    if (filter === 'room' || filter === 'bed') {
      return bookings.filter(booking => booking.bookingType === filter).length
    }
    return bookings.filter(booking => booking.status === filter).length
  }

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const hotelId = getHotelId()
      const success = await bookingService.deleteBooking(hotelId, bookingId)
      
      if (success) {
        setBookings(prev => prev.filter(booking => booking.id !== bookingId))
        setShowBookingModal(false)
      } else {
        setError('Failed to delete booking')
      }
    } catch (err) {
      setError('Failed to delete booking')
      console.error('Error deleting booking:', err)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return getFilteredBookings().filter(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      return date >= checkIn && date <= checkOut
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayBookings = getBookingsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`h-24 border border-gray-200 p-1 overflow-y-auto ${
          isToday ? 'bg-blue-50' : 'bg-white'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayBookings.slice(0, 2).map(booking => (
              <div 
                key={booking.id}
                className={`text-xs p-1 rounded cursor-pointer ${
                  booking.bookingType === 'room' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}
                onClick={() => {
                  setSelectedBooking(booking)
                  setShowBookingModal(true)
                }}
              >
                {booking.guestName.split(' ')[0]}
                {booking.roomNumber && ` - ${booking.roomNumber}`}
                {booking.bedNumber && ` - ${booking.bedNumber}`}
              </div>
            ))}
            {dayBookings.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayBookings.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center font-medium text-gray-700 border-b border-gray-200">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  const renderListView = () => {
    const filteredBookings = getFilteredBookings()

    return (
      <div className="space-y-4">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  booking.bookingType === 'room' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <h3 className="font-semibold text-gray-900">{booking.guestName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedBooking(booking)
                  setShowBookingModal(true)
                }}>
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Check-in:</span>
                <div className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Check-out:</span>
                <div className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Accommodation:</span>
                <div className="font-medium">
                  {booking.bookingType === 'room' ? `Room ${booking.roomNumber}` : `Bed ${booking.bedNumber}`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Total: <span className="font-semibold text-green-600">${booking.totalAmount}</span></span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Booked: {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found for the selected filter.</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={fetchBookings}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-600 mt-1">Manage room and bed bookings with calendar view</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={viewType === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewType('calendar')}
          >
            Calendar
          </Button>
          <Button 
            variant={viewType === 'list' ? 'default' : 'outline'}
            onClick={() => setViewType('list')}
          >
            List
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name, email, room, or bed number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all' as FilterType, label: 'All' },
            { key: 'room' as FilterType, label: 'Rooms' },
            { key: 'bed' as FilterType, label: 'Beds' },
            { key: 'confirmed' as FilterType, label: 'Confirmed' },
            { key: 'pending' as FilterType, label: 'Pending' },
            { key: 'checked_in' as FilterType, label: 'Checked In' }
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
      </div>

      {/* Calendar Navigation */}
      {viewType === 'calendar' && (
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      {viewType === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <Button variant="outline" size="sm" onClick={() => setShowBookingModal(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                  <p className="text-gray-900">{selectedBooking.guestName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedBooking.guestEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedBooking.guestPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                  <p className="text-gray-900 capitalize">{selectedBooking.bookingType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <p className="text-gray-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <p className="text-gray-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation</label>
                  <p className="text-gray-900">
                    {selectedBooking.bookingType === 'room' 
                      ? `Room ${selectedBooking.roomNumber} (${selectedBooking.roomType?.replace('_', ' ')})`
                      : `Bed ${selectedBooking.bedNumber} (${selectedBooking.bedType})`
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <p className="text-green-600 font-semibold">${selectedBooking.totalAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                    {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Edit Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}