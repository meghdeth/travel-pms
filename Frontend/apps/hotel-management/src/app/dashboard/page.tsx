'use client'

import { useEffect, useState } from 'react'
import { Button } from 'ui'
import { 
  RefreshCw, Building2, Calendar, DollarSign, Users, TrendingUp, 
  Clock, CheckCircle, AlertTriangle, Bed, UserCheck, Phone,
  Mail, MapPin, Star, BarChart3, PieChart, Activity
} from 'lucide-react'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'

// Enhanced mock data for comprehensive dashboard
const mockStats = {
  totalRooms: 45,
  occupiedRooms: 32,
  availableRooms: 13,
  outOfOrderRooms: 2,
  todayRevenue: 2850,
  monthlyRevenue: 85600,
  totalBookings: 28,
  pendingBookings: 5,
  checkInsToday: 8,
  checkOutsToday: 6,
  averageRoomRate: 125,
  occupancyRate: 71.1,
  revPAR: 88.9, // Revenue Per Available Room
  guestSatisfaction: 4.6,
  totalGuests: 156,
  repeatGuests: 23
}

const mockRecentActivities = [
  {
    id: 1,
    type: 'check-in',
    message: 'John Smith checked into Room 205',
    time: '10 minutes ago',
    icon: UserCheck,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'booking',
    message: 'New booking received for Room 312',
    time: '25 minutes ago',
    icon: Calendar,
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'maintenance',
    message: 'Room 108 maintenance completed',
    time: '1 hour ago',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    id: 4,
    type: 'alert',
    message: 'Room 401 requires immediate attention',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-red-600'
  }
]

const mockUpcomingArrivals = [
  {
    id: 'BK001',
    guestName: 'Sarah Johnson',
    roomNumber: '205',
    arrivalTime: '14:00',
    nights: 3,
    amount: 375,
    guestType: 'VIP'
  },
  {
    id: 'BK002',
    guestName: 'Mike Davis',
    roomNumber: '312',
    arrivalTime: '15:30',
    nights: 2,
    amount: 250,
    guestType: 'Regular'
  },
  {
    id: 'BK003',
    guestName: 'Emily Wilson',
    roomNumber: '108',
    arrivalTime: '16:00',
    nights: 4,
    amount: 500,
    guestType: 'Corporate'
  }
]

const mockUpcomingDepartures = [
  {
    id: 'BK004',
    guestName: 'Robert Brown',
    roomNumber: '203',
    departureTime: '11:00',
    totalStay: 3,
    totalAmount: 390,
    status: 'Checked Out'
  },
  {
    id: 'BK005',
    guestName: 'Lisa Anderson',
    roomNumber: '407',
    departureTime: '12:00',
    totalStay: 2,
    totalAmount: 280,
    status: 'Pending Checkout'
  }
]

export default function HotelDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(mockStats)
  const [recentActivities, setRecentActivities] = useState(mockRecentActivities)
  const [upcomingArrivals, setUpcomingArrivals] = useState(mockUpcomingArrivals)
  const [upcomingDepartures, setUpcomingDepartures] = useState(mockUpcomingDepartures)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await hotelAuthService.isAuthenticated()
        if (!isAuthenticated) {
          router.push('/login')
          return
        }
        // Simulate loading time
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-area flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getGuestTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800'
      case 'Corporate':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content-area">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your hotel overview for today.</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => router.push('/reports')}
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
            <Button 
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1000)
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.occupancyRate}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5.2% from last month</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">RevPAR</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${stats.revPAR}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-gray-500">Revenue Per Available Room</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${stats.todayRevenue}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-green-600">+12% from yesterday</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Guest Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.guestSatisfaction}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-gray-500">Out of 5.0 rating</span>
            </div>
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRooms}</p>
              </div>
              <Building2 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.occupiedRooms}</p>
              </div>
              <Bed className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.availableRooms}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Order</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.outOfOrderRooms}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-gray-50`}>
                        <IconComponent className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Arrivals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Today's Arrivals</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingArrivals.map((arrival) => (
                  <div key={arrival.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{arrival.guestName}</p>
                      <p className="text-sm text-gray-500">Room {arrival.roomNumber} • {arrival.arrivalTime}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getGuestTypeColor(arrival.guestType)}`}>
                        {arrival.guestType}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${arrival.amount}</p>
                      <p className="text-xs text-gray-500">{arrival.nights} nights</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Departures */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Today's Departures</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingDepartures.map((departure) => (
                  <div key={departure.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{departure.guestName}</p>
                      <p className="text-sm text-gray-500">Room {departure.roomNumber} • {departure.departureTime}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        departure.status === 'Checked Out' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {departure.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${departure.totalAmount}</p>
                      <p className="text-xs text-gray-500">{departure.totalStay} nights</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button 
              onClick={() => router.push('/bookings/new')}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">New Booking</span>
            </Button>
            <Button 
              onClick={() => router.push('/rooms')}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <Building2 className="w-6 h-6 mb-2" />
              <span className="text-sm">Room Status</span>
            </Button>
            <Button 
              onClick={() => router.push('/guests')}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Guest List</span>
            </Button>
            <Button 
              onClick={() => router.push('/housekeeping')}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <CheckCircle className="w-6 h-6 mb-2" />
              <span className="text-sm">Housekeeping</span>
            </Button>
            <Button 
              onClick={() => router.push('/reports')}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <BarChart3 className="w-6 h-6 mb-2" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button 
              onClick={() => router.push('/staff')}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <UserCheck className="w-6 h-6 mb-2" />
              <span className="text-sm">Staff</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}