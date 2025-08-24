import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: LucideIcon
}

export function StatsCard({ title, value, change, changeType, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {changeType === 'increase' ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${
          changeType === 'increase' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">from last month</span>
      </div>
    </div>
  )
}