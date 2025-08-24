'use client'

import { Button } from 'ui'
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign, Building2 } from 'lucide-react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { RecentBookings } from '../../components/dashboard/RecentBookings'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { HotelPerformance } from '../../components/dashboard/HotelPerformance'

export default function VendorDashboard() {
  const stats = [
    {
      title: 'Total Hotels',
      value: '8',
      change: '+2',
      changeType: 'increase' as const,
      icon: Building2
    },
    {
      title: 'Total Rooms',
      value: '156',
      change: '+12',
      changeType: 'increase' as const,
      icon: Calendar
    },
    {
      title: 'Active Bookings',
      value: '234',
      change: '-5',
      changeType: 'decrease' as const,
      icon: Calendar
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      change: '+15%',
      changeType: 'increase' as const,
      icon: DollarSign
    }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Hotel</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <HotelPerformance />
      </div>

      {/* Recent Bookings */}
      <RecentBookings />
    </div>
  )
}