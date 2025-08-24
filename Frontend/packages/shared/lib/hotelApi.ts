import { apiClient } from './api';

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  todayRevenue: number;
  totalBookings: number;
}

export interface RecentBooking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
}

class HotelApiService {
  async getDashboardStats(): Promise<{ data: DashboardStats }> {
    try {
      const response = await apiClient.get('/hotel/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  async getRecentBookings(): Promise<{ data: RecentBooking[] }> {
    try {
      const response = await apiClient.get('/hotel/dashboard/recent-bookings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error);
      throw error;
    }
  }

  async getRooms(): Promise<{ data: any[] }> {
    try {
      const response = await apiClient.get('/hotel/rooms');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      throw error;
    }
  }

  async getBookings(): Promise<{ data: any[] }> {
    try {
      const response = await apiClient.get('/hotel/bookings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    }
  }
}

export const hotelApiService = new HotelApiService();