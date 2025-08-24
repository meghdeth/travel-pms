'use client'

import { TrendingUp } from 'lucide-react'

export function RevenueChart() {
  const monthlyData = [
    { month: 'Jan', revenue: 35000 },
    { month: 'Feb', revenue: 42000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 45000 },
    { month: 'May', revenue: 52000 },
    { month: 'Jun', revenue: 48000 }
  ]

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+12.5%</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {monthlyData.map((data) => (
          <div key={data.month} className="flex items-center space-x-4">
            <div className="w-8 text-sm text-gray-600">{data.month}</div>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 text-right">
              ${(data.revenue / 1000).toFixed(0)}k
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Revenue (6 months)</span>
          <span className="font-semibold text-gray-900">$260,000</span>
        </div>
      </div>
    </div>
  )
}