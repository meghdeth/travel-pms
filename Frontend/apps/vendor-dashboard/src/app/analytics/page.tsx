'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, Building2, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,678',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign
    },
    {
      title: 'Occupancy Rate',
      value: '78.5%',
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: Building2
    },
    {
      title: 'Average Daily Rate',
      value: '$156',
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: TrendingUp
    },
    {
      title: 'Total Guests',
      value: '1,234',
      change: '+8.7%',
      changeType: 'increase' as const,
      icon: Users
    }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your business performance</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {metric.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Occupancy chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Hotel */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance by Hotel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ADR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RevPAR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Grand Plaza Hotel
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$18,450</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">85%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$165</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$140</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Seaside Resort
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$15,200</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">78%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$145</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$113</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Mountain View Lodge
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$12,028</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">72%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$125</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$90</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}