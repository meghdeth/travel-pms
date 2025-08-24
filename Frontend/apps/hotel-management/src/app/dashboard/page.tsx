'use client'

import { useEffect, useState } from 'react'
import { Button } from 'ui'
import { 
  RefreshCw, Building2, Calendar, DollarSign, Users, TrendingUp, 
  Clock, CheckCircle, AlertTriangle, Bed, UserCheck, UserX, Phone,
  Mail, MapPin, Star, BarChart3, PieChart, Activity
} from 'lucide-react'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { hotelApiService, HotelStats } from '../../services/hotelApiService'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'

// Types for dashboard data
interface DashboardActivity {
  id: string
  type: string
  message: string
  time: string
  icon: any
  color: string
}

interface Arrival {
  id: string
  guestName: string
  roomNumber: string
  arrivalTime: string
  nights: number
  amount: number
  guestType: string
}

interface Departure {
  id: string
  guestName: string
  roomNumber: string
  departureTime: string
  totalStay: number
  totalAmount: number
  status: string
}

export default function HotelDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<HotelStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recentActivities, setRecentActivities] = useState<DashboardActivity[]>([])
  const [upcomingArrivals, setUpcomingArrivals] = useState<Arrival[]>([])
  const [upcomingDepartures, setUpcomingDepartures] = useState<Departure[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all dashboard data in parallel
      const [dashboardStats] = await Promise.all([
        hotelApiService.getDashboardStats(),
        // TODO: Add more API calls for activities, arrivals, departures when backend endpoints are available
        // hotelApiService.getRecentActivities(),
        // hotelApiService.getTodaysArrivals(),
        // hotelApiService.getTodaysDepartures()
      ])
      
      setStats(dashboardStats)
      
      // For now, show empty arrays until real API endpoints are implemented
      setRecentActivities([])
      setUpcomingArrivals([])
      setUpcomingDepartures([])
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
      // Fallback to empty stats structure
      setStats({
        totalRooms: 0,
        occupiedRooms: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        monthlyRevenue: 0,
        pendingBookings: 0,
        occupancyRate: 0
      })
    } finally {
      setLoading(false)
    }
  }

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

  if (error) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-area">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <div className="mt-3">
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
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
              onClick={loadDashboardData}
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.occupancyRate || 0}%</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">${((stats?.monthlyRevenue || 0) / (stats?.totalRooms || 1)).toFixed(0)}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">${stats?.monthlyRevenue || 0}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">N/A</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalRooms || 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats?.occupiedRooms || 0}</p>
              </div>
              <Bed className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{(stats?.totalRooms || 0) - (stats?.occupiedRooms || 0)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Order</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">0</p>
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
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">No recent activities</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => {
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
                  })
                )}
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
                {upcomingArrivals.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">No arrivals scheduled for today</p>
                  </div>
                ) : (
                  upcomingArrivals.map((arrival) => (
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
                  ))
                )}
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
                {upcomingDepartures.length === 0 ? (
                  <div className="text-center py-8">
                    <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">No departures scheduled for today</p>
                  </div>
                ) : (
                  upcomingDepartures.map((departure) => (
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
                  ))
                )}
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