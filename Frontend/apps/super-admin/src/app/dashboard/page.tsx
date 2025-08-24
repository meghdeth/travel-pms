'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from 'ui'
import { superAdminApiService } from '../../services/superAdminApiService'

// Define types for better type safety
interface StatData {
  title: string
  value: string
  color: string
  change: string
  changeType: 'positive' | 'negative'
  icon: string
}

export default function SuperAdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdminApiService.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Get user data and dashboard stats
    const userData = superAdminApiService.getUser()
    setUser(userData)

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const dashboardStats = await superAdminApiService.getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleLogout = async () => {
    try {
      await superAdminApiService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  const statsData: StatData[] = stats ? [
    {
      title: 'Total Vendors',
      value: stats.totalVendors.toString(),
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'Total Hotels', 
      value: stats.totalHotels.toString(),
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive',
      icon: '🏨'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings.toLocaleString(),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      change: '+15%',
      changeType: 'positive',
      icon: '📅'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      change: '+23%',
      changeType: 'positive',
      icon: '💰'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      change: '+0.2%',
      changeType: 'positive',
      icon: '⚡'
    },
    {
      title: 'Pending Issues',
      value: stats.pendingIssues.toString(),
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      change: '-2',
      changeType: 'negative',
      icon: '⚠️'
    }
  ] : []

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'vendors', label: 'Vendor Management', icon: '👥' },
    { id: 'hotels', label: 'Hotel Management', icon: '🏨' },
    { id: 'bookings', label: 'Booking Management', icon: '📅' },
    { id: 'analytics', label: 'Analytics & Reports', icon: '📈' },
    { id: 'system', label: 'System Settings', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ]

  const recentActivities = [
    { id: 1, type: 'vendor', message: 'New vendor "Luxury Stays" registered', time: '2 hours ago', status: 'pending' },
    { id: 2, type: 'booking', message: 'High-value booking ($2,500) completed', time: '4 hours ago', status: 'success' },
    { id: 3, type: 'system', message: 'System backup completed successfully', time: '6 hours ago', status: 'info' },
    { id: 4, type: 'alert', message: 'Server CPU usage above 80%', time: '8 hours ago', status: 'warning' }
  ]

  const topVendors = [
    { id: 1, name: 'Premium Hotels Group', revenue: '$12,450', bookings: 89, growth: '+15%' },
    { id: 2, name: 'City Center Suites', revenue: '$8,920', bookings: 67, growth: '+8%' },
    { id: 3, name: 'Beachfront Resorts', revenue: '$7,680', bookings: 45, growth: '+22%' },
    { id: 4, name: 'Mountain View Lodge', revenue: '$6,340', bookings: 38, growth: '+5%' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-xl border-r border-gray-200 min-h-screen">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Travel PMS</h1>
                <p className="text-sm text-gray-500">Super Admin Panel</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-8 px-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-all duration-200 group ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <span className="text-lg mr-4 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h2>
                <p className="text-lg text-gray-600">Here's what's happening with your travel management system today.</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex items-center gap-2 px-6 py-3 border-2 hover:border-blue-500 hover:text-blue-600 transition-colors">
                  🔔 Notifications
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2 animate-pulse">3</span>
                </Button>
                <Button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                  📊 Generate Report
                </Button>
                <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {statsData.map((stat: StatData, index: number) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-3">{stat.value}</p>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">📈</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.color} shadow-lg`}>
                    <span className="text-white text-2xl">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            {/* Recent Activities */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Live</span>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      activity.status === 'pending' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 py-3 border-2 hover:border-blue-500 hover:text-blue-600 transition-colors">
                View All Activities
              </Button>
            </div>

            {/* Top Performing Vendors */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Top Performing Vendors</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">This Month</span>
              </div>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-blue-400 to-blue-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{vendor.revenue}</p>
                      <p className="text-xs font-semibold text-green-600">{vendor.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 py-3 border-2 hover:border-blue-500 hover:text-blue-600 transition-colors">
                View All Vendors
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                👥 Add New Vendor
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-3 h-14 border-2 hover:border-green-500 hover:text-green-600 transition-colors">
                🏨 Manage Hotels
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-3 h-14 border-2 hover:border-purple-500 hover:text-purple-600 transition-colors">
                📊 View Reports
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-3 h-14 border-2 hover:border-orange-500 hover:text-orange-600 transition-colors">
                ⚙️ System Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}