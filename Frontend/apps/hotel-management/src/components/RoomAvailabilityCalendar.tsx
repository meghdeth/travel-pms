'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, DollarSign } from 'lucide-react'
import { Button } from 'ui'

// Calendar component for room availability
interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  availability: {
    available: number
    occupied: number
    maintenance: number
  }
  averageRate: number
}

interface RoomAvailabilityCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

export default function RoomAvailabilityCalendar({ onDateSelect, selectedDate }: RoomAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)
      
      // Mock availability data
      const mockAvailability = {
        available: Math.floor(Math.random() * 20) + 5,
        occupied: Math.floor(Math.random() * 15) + 10,
        maintenance: Math.floor(Math.random() * 3)
      }
      
      days.push({
        date: currentDay,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        availability: mockAvailability,
        averageRate: Math.floor(Math.random() * 100) + 100
      })
    }
    
    return days
  }
  
  const calendarDays = generateCalendarDays(currentDate)
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }
  
  const getAvailabilityColor = (day: CalendarDay) => {
    const total = day.availability.available + day.availability.occupied + day.availability.maintenance
    const occupancyRate = day.availability.occupied / total
    
    if (occupancyRate >= 0.9) return 'bg-red-100 border-red-300'
    if (occupancyRate >= 0.7) return 'bg-yellow-100 border-yellow-300'
    return 'bg-green-100 border-green-300'
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              p-2 border rounded cursor-pointer transition-colors
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isToday ? 'bg-blue-100 border-blue-300' : getAvailabilityColor(day)}
              ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-blue-500' : ''}
              hover:bg-opacity-80
            `}
            onClick={() => onDateSelect?.(day.date)}
          >
            <div className="text-sm font-medium">{day.date.getDate()}</div>
            {day.isCurrentMonth && (
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-green-600">{day.availability.available}</span>
                  <span className="text-red-600">{day.availability.occupied}</span>
                </div>
                <div className="text-gray-500">${day.averageRate}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Low Occupancy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Medium Occupancy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>High Occupancy</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <span className="text-green-600">Available</span>
          <span className="text-red-600">Occupied</span>
        </div>
      </div>
    </div>
  )
}