'use client'

import React, { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/apiService';
import KPICard from '../ui/KPICard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface KPIData {
  occupancyRate: number;
  totalRevenue: number;
  averageDailyRate: number;
  todayBookings: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  dirtyRooms: number;
}

interface ActivityData {
  recentBookings: Array<{
    id: string;
    guestName: string;
    roomType: string;
    checkIn: string;
    status: string;
    totalAmount: number;
  }>;
  tasksSummary: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  notifications: Array<{
    id: number;
    type: string;
    message: string;
    priority: string;
    createdAt: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch KPI data from API
      const [kpiResponse, activityResponse] = await Promise.all([
        dashboardApi.getAdminKPIs(),
        dashboardApi.getAdminActivity()
      ]);
      
      if (kpiResponse?.success) {
        setKpiData(kpiResponse.data);
      } else {
        throw new Error('Failed to fetch KPI data');
      }
      
      if (activityResponse?.success) {
        setActivityData(activityResponse.data);
      } else {
        throw new Error('Failed to fetch activity data');
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
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
              icon={<ChartBarIcon className="h-8 w-8" />}
              loading={true}
            />
          ))}
        </div>
        <LoadingSpinner size="lg" text="Loading dashboard data..." className="my-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'checked_in': return 'text-green-600 bg-green-50';
      case 'checked_out': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Occupancy Rate"
          value={`${kpiData?.occupancyRate || 0}%`}
          icon={<ChartBarIcon />}
          color="blue"
          subtitle="Current occupancy"
        />
        
        <KPICard
          title="Total Revenue"
          value={`$${kpiData?.totalRevenue?.toLocaleString() || '0'}`}
          icon={<CurrencyDollarIcon />}
          color="green"
          subtitle="This month"
        />
        
        <KPICard
          title="Today's Bookings"
          value={kpiData?.todayBookings || 0}
          icon={<CalendarDaysIcon />}
          color="purple"
          subtitle="New bookings today"
        />
        
        <KPICard
          title="Average Daily Rate"
          value={`$${kpiData?.averageDailyRate || 0}`}
          icon={<HomeIcon />}
          color="orange"
          subtitle="ADR"
        />
      </div>

      {/* Room Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{kpiData?.availableRooms || 0}</p>
            <p className="text-sm text-green-700">Available</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{kpiData?.occupiedRooms || 0}</p>
            <p className="text-sm text-blue-700">Occupied</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{kpiData?.dirtyRooms || 0}</p>
            <p className="text-sm text-yellow-700">Dirty</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{kpiData?.maintenanceRooms || 0}</p>
            <p className="text-sm text-red-700">Maintenance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {activityData?.recentBookings && activityData.recentBookings.length > 0 ? (
              activityData.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{booking.guestName}</p>
                    <p className="text-sm text-gray-600">{booking.roomType} - {booking.id}</p>
                    <p className="text-sm text-gray-500">Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-1">${booking.totalAmount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent bookings</p>
            )}
          </div>
          <div className="mt-4">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all bookings →
            </button>
          </div>
        </div>

        {/* Tasks & Notifications */}
        <div className="space-y-6">
          {/* Tasks Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-semibold text-yellow-600">{activityData?.tasksSummary?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-gray-700">In Progress</span>
                </div>
                <span className="font-semibold text-orange-600">{activityData?.tasksSummary?.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Completed</span>
                </div>
                <span className="font-semibold text-green-600">{activityData?.tasksSummary?.completed || 0}</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              {activityData?.notifications && activityData.notifications.length > 0 ? (
                activityData.notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <ExclamationTriangleIcon className={`h-5 w-5 mt-1 mr-3 ${getPriorityColor(notification.priority)}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              )}
            </div>
            <div className="mt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all notifications →
              </button>
            </div>
          </div>
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
            <CalendarDaysIcon className="h-6 w-6 mx-auto mb-2" />
            New Booking
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors">
            <HomeIcon className="h-6 w-6 mx-auto mb-2" />
            Manage Rooms
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 font-medium transition-colors">
            <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;