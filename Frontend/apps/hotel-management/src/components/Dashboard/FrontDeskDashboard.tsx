'use client'

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/apiService';
import KPICard from '../ui/KPICard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FrontDeskData {
  todayCheckIns: Array<{
    id: string;
    guestName: string;
    roomType: string;
    checkIn: string;
    status: string;
  }>;
  todayCheckOuts: Array<{
    id: string;
    guestName: string;
    roomNumber: string;
    checkOut: string;
  }>;
  roomStatus: Array<{
    roomNumber: string;
    status: 'available' | 'occupied' | 'dirty' | 'maintenance';
    guestName?: string;
    checkOut?: string;
    needsAttention: boolean;
  }>;
  summary: {
    totalCheckIns: number;
    totalCheckOuts: number;
    availableRooms: number;
    occupiedRooms: number;
    roomsNeedingAttention: number;
  };
}

const FrontDeskDashboard: React.FC = () => {
  const [data, setData] = useState<FrontDeskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFrontDeskData();
  }, []);

  const fetchFrontDeskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getFrontDeskOverview();
      
      if (response?.success) {
        setData(response.data);
      } else {
        throw new Error('Failed to fetch front desk data');
      }
    } catch (error: any) {
      console.error('Failed to fetch front desk data:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load front desk data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await dashboardApi.searchBookings(searchQuery);
      if (response?.success) {
        // Handle search results - you might want to show them in a modal or separate component
        console.log('Search results:', response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'dirty': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <KPICard
              key={i}
              title="Loading..."
              value=""
              icon={<UserGroupIcon className="h-8 w-8" />}
              loading={true}
            />
          ))}
        </div>
        <LoadingSpinner size="lg" text="Loading front desk data..." className="my-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Front Desk Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchFrontDeskData}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Today's Check-ins"
          value={data?.summary?.totalCheckIns || 0}
          icon={<UserGroupIcon />}
          color="blue"
          subtitle="Arrivals today"
        />
        
        <KPICard
          title="Today's Check-outs"
          value={data?.summary?.totalCheckOuts || 0}
          icon={<CheckCircleIcon />}
          color="green"
          subtitle="Departures today"
        />
        
        <KPICard
          title="Available Rooms"
          value={data?.summary?.availableRooms || 0}
          icon={<CheckCircleIcon />}
          color="green"
          subtitle="Ready for guests"
        />
        
        <KPICard
          title="Needs Attention"
          value={data?.summary?.roomsNeedingAttention || 0}
          icon={<ExclamationTriangleIcon />}
          color="red"
          subtitle="Requires action"
        />
      </div>

      {/* Quick Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Search</h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by guest name, booking ID, or room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Today's Check-ins */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Check-ins</h2>
          <div className="space-y-3">
            {data?.todayCheckIns && data.todayCheckIns.length > 0 ? (
              data.todayCheckIns.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{checkin.guestName}</p>
                    <p className="text-sm text-gray-600">{checkin.roomType} - {checkin.id}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      checkin.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {checkin.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(checkin.checkIn).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No check-ins scheduled for today</p>
            )}
          </div>
        </div>

        {/* Today's Check-outs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Check-outs</h2>
          <div className="space-y-3">
            {data?.todayCheckOuts && data.todayCheckOuts.length > 0 ? (
              data.todayCheckOuts.map((checkout) => (
                <div key={checkout.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{checkout.guestName}</p>
                    <p className="text-sm text-gray-600">Room {checkout.roomNumber} - {checkout.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(checkout.checkOut).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No check-outs scheduled for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Room Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.roomStatus && data.roomStatus.length > 0 ? (
            data.roomStatus.map((room) => (
              <div 
                key={room.roomNumber} 
                className={`p-4 rounded-lg border-2 ${
                  room.needsAttention ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                <div className="text-center">
                  <p className="font-bold text-lg text-gray-900">{room.roomNumber}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                  {room.guestName && (
                    <p className="text-sm text-gray-600 mt-2">{room.guestName}</p>
                  )}
                  {room.checkOut && (
                    <p className="text-xs text-gray-500">
                      Until: {new Date(room.checkOut).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-gray-500 text-center py-4">No room data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
            <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
            Check-in Guest
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors">
            <CheckCircleIcon className="h-6 w-6 mx-auto mb-2" />
            Check-out Guest
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors">
            <ClockIcon className="h-6 w-6 mx-auto mb-2" />
            Walk-in Booking
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 font-medium transition-colors">
            <ExclamationTriangleIcon className="h-6 w-6 mx-auto mb-2" />
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrontDeskDashboard;