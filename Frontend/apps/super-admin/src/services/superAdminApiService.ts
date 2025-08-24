import { apiClient } from 'shared/lib/api';

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
      email: string;
      status: string;
    };
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface SuperAdminStats {
  totalVendors: number;
  totalHotels: number;
  activeBookings: number;
  totalRevenue: number;
  systemHealth: number;
  pendingIssues: number;
}

class SuperAdminApiService {
  // Authentication
  async login(credentials: SuperAdminLoginRequest): Promise<SuperAdminLoginResponse> {
    try {
      const response = await apiClient.post('/auth/super-admin/login', credentials);
      
      if (response.data.success && response.data.data) {
        // Store authentication data
        localStorage.setItem('superAdminToken', response.data.data.token);
        localStorage.setItem('superAdminRefreshToken', response.data.data.refreshToken);
        localStorage.setItem('superAdminUser', JSON.stringify(response.data.data.user));
        localStorage.setItem('superAdminAuthenticated', 'true');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminRefreshToken');
      localStorage.removeItem('superAdminUser');
      localStorage.removeItem('superAdminAuthenticated');
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<SuperAdminStats> {
    try {
      const response = await apiClient.get('/super-admin/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return mock data as fallback
      return {
        totalVendors: 24,
        totalHotels: 156,
        activeBookings: 1234,
        totalRevenue: 45678,
        systemHealth: 98.5,
        pendingIssues: 3
      };
    }
  }

  // Vendor Management
  async getVendors(page = 1, limit = 10, search = '') {
    try {
      const response = await apiClient.get('/super-admin/vendors', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      throw error;
    }
  }

  // Hotel Management
  async getHotels(page = 1, limit = 10, search = '') {
    try {
      const response = await apiClient.get('/super-admin/hotels', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      throw error;
    }
  }

  // System Management
  async getSystemLogs(page = 1, limit = 50) {
    try {
      const response = await apiClient.get('/super-admin/system/logs', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return localStorage.getItem('superAdminAuthenticated') === 'true';
  }

  getUser() {
    const userStr = localStorage.getItem('superAdminUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('superAdminToken');
  }
}

export const superAdminApiService = new SuperAdminApiService();