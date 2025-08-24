import { MoreHorizontal, Edit, Trash2, Eye, MapPin, Users, DollarSign } from 'lucide-react'
import { Button } from 'ui'

interface Hotel {
  id: number
  name: string
  location: string
  rooms: number
  occupancy: number
  revenue: string
  status: 'active' | 'maintenance' | 'inactive'
  image: string
}

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {/* Placeholder for hotel image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span className="text-sm">Hotel Image</span>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
            {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{hotel.name}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{hotel.location}</span>
            </div>
          </div>
          <div className="relative">
            <Button variant="outline" size="sm" className="p-1">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-gray-400 mr-1" />
            </div>
            <p className="text-sm text-gray-600">Rooms</p>
            <p className="font-semibold">{hotel.rooms}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded mr-1"></div>
            </div>
            <p className="text-sm text-gray-600">Occupancy</p>
            <p className="font-semibold">{hotel.occupancy}%</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
            </div>
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="font-semibold">{hotel.revenue}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}