'use client'

import { Calendar, User, MapPin } from 'lucide-react'

interface Booking {
  id: string
  guestName: string
  hotelName: string
  roomType: string
  checkIn: string
  checkOut: string
  status: 'confirmed' | 'pending' | 'cancelled'
  amount: string
}

const mockBookings: Booking[] = [
  {
    id: 'BK001',
    guestName: 'John Smith',
    hotelName: 'Grand Plaza Hotel',
    roomType: 'Deluxe Suite',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    status: 'confirmed',
    amount: '$450'
  },
  {
    id: 'BK002',
    guestName: 'Sarah Johnson',
    hotelName: 'Ocean View Resort',
    roomType: 'Standard Room',
    checkIn: '2024-01-16',
    checkOut: '2024-01-19',
    status: 'pending',
    amount: '$320'
  },
  {
    id: 'BK003',
    guestName: 'Mike Davis',
    hotelName: 'City Center Inn',
    roomType: 'Executive Room',
    checkIn: '2024-01-17',
    checkOut: '2024-01-20',
    status: 'confirmed',
    amount: '$280'
  }
]

export function RecentBookings() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
      <div className="space-y-4">
        {mockBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{booking.guestName}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.hotelName}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.checkIn} - {booking.checkOut}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{booking.amount}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}