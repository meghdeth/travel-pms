'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Search, Filter, Calendar, MapPin, User, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Booking {
  id: string
  guestName: string
  hotelName: string
  roomType: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  amount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus: 'paid' | 'pending' | 'failed'
  bookingDate: string
}

const mockBookings: Booking[] = [
  {
    id: 'BK001',
    guestName: 'John Smith',
    hotelName: 'Grand Plaza Hotel',
    roomType: 'Deluxe Suite',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    nights: 3,
    guests: 2,
    amount: 450,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-10'
  },
  {
    id: 'BK002',
    guestName: 'Sarah Johnson',
    hotelName: 'Seaside Resort',
    roomType: 'Ocean View',
    checkIn: '2024-01-20',
    checkOut: '2024-01-25',
    nights: 5,
    guests: 4,
    amount: 750,
    status: 'pending',
    paymentStatus: 'pending',
    bookingDate: '2024-01-12'
  },
  {
    id: 'BK003',
    guestName: 'Mike Wilson',
    hotelName: 'Mountain View Lodge',
    roomType: 'Standard Room',
    checkIn: '2024-01-22',
    checkOut: '2024-01-24',
    nights: 2,
    guests: 1,
    amount: 180,
    status: 'cancelled',
    paymentStatus: 'failed',
    bookingDate: '2024-01-11'
  }
]

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
}

const StatusIcon = ({ status }: { status: Booking['status'] }) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-red-600" />
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-blue-600" />
  }
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage all your hotel bookings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$12,450</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Guests</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel & Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                      <div className="text-sm text-gray-500">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.hotelName}</div>
                      <div className="text-sm text-gray-500">{booking.roomType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{booking.checkIn} - {booking.checkOut}</div>
                      <div className="text-sm text-gray-500">{booking.nights} night{booking.nights > 1 ? 's' : ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon status={booking.status} />
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}