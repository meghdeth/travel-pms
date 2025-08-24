'use client'

import { Star, TrendingUp, TrendingDown } from 'lucide-react'

interface HotelPerformance {
  id: string
  name: string
  occupancyRate: number
  averageRating: number
  totalBookings: number
  revenue: number
  trend: 'up' | 'down'
  trendValue: string
}

const mockHotels: HotelPerformance[] = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    occupancyRate: 85,
    averageRating: 4.8,
    totalBookings: 156,
    revenue: 45600,
    trend: 'up',
    trendValue: '+12%'
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    occupancyRate: 92,
    averageRating: 4.6,
    totalBookings: 203,
    revenue: 62400,
    trend: 'up',
    trendValue: '+8%'
  },
  {
    id: '3',
    name: 'City Center Inn',
    occupancyRate: 78,
    averageRating: 4.3,
    totalBookings: 134,
    revenue: 38200,
    trend: 'down',
    trendValue: '-3%'
  }
]

export function HotelPerformance() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Hotel Performance</h3>
      
      <div className="space-y-6">
        {mockHotels.map((hotel) => (
          <div key={hotel.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{hotel.name}</h4>
              <div className={`flex items-center space-x-1 text-sm ${
                hotel.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {hotel.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{hotel.trendValue}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Occupancy Rate</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${hotel.occupancyRate}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{hotel.occupancyRate}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{hotel.averageRating}</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600">Total Bookings</p>
                <p className="font-medium">{hotel.totalBookings}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Revenue</p>
                <p className="font-medium">${(hotel.revenue / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}