import axios, { AxiosResponse, AxiosError } from 'axios';

// API Configuration from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // Generic GET method
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    try {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  // Generic POST method
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  // Generic PUT method
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  // Generic DELETE method
  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  // File upload method
  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`UPLOAD ${endpoint} failed:`, error);
      throw error;
    }
  }
};

// Dashboard API methods
export const dashboardApi = {
  getAdminKPIs: (hotelId?: string) => 
    apiService.get('/dashboard/admin/kpis', { hotelId }),
  
  getAdminActivity: (hotelId?: string) => 
    apiService.get('/dashboard/admin/activity', { hotelId }),
  
  getFrontDeskOverview: (hotelId?: string) => 
    apiService.get('/dashboard/frontdesk/overview', { hotelId }),
  
  getFinanceOverview: (period?: string, hotelId?: string) => 
    apiService.get('/dashboard/finance/overview', { period, hotelId }),
  
  getTasksOverview: (hotelId?: string) => 
    apiService.get('/dashboard/tasks/overview', { hotelId }),
  
  updateTaskStatus: (taskId: number, data: { status: string; notes?: string }) => 
    apiService.put(`/dashboard/tasks/${taskId}/status`, data),
  
  createTask: (data: any) => 
    apiService.post('/dashboard/tasks', data),
  
  searchBookings: (query: string) => 
    apiService.get('/dashboard/search/bookings', { query })
};

// Staff API methods
export const staffApi = {
  getAllStaff: (params?: { hotelId?: string; role?: string; status?: string }) => 
    apiService.get('/staff', params),
  
  getStaffById: (id: string) => 
    apiService.get(`/staff/${id}`),
  
  createStaff: (data: any) => 
    apiService.post('/staff', data),
  
  updateStaff: (id: string, data: any) => 
    apiService.put(`/staff/${id}`, data),
  
  deleteStaff: (id: string) => 
    apiService.delete(`/staff/${id}`),
  
  getRolesPermissions: () => 
    apiService.get('/staff/roles/permissions'),
  
  resetStaffPassword: (id: string, data: { newPassword: string }) => 
    apiService.post(`/staff/${id}/reset-password`, data)
};

// Voucher API methods
export const voucherApi = {
  getAllVouchers: (params?: { hotelId?: string; status?: string; type?: string }) => 
    apiService.get('/vouchers', params),
  
  getVoucherById: (id: number) => 
    apiService.get(`/vouchers/${id}`),
  
  validateVoucher: (data: { code: string; bookingAmount: number; roomType?: string }) => 
    apiService.post('/vouchers/validate', data),
  
  createVoucher: (data: any) => 
    apiService.post('/vouchers', data),
  
  updateVoucher: (id: number, data: any) => 
    apiService.put(`/vouchers/${id}`, data),
  
  deleteVoucher: (id: number) => 
    apiService.delete(`/vouchers/${id}`),
  
  getVoucherAnalytics: (params?: { period?: string; voucherId?: number }) => 
    apiService.get('/vouchers/analytics/usage', params)
};

// Booking API methods
export const bookingApi = {
  getAllBookings: (params?: any) => 
    apiService.get('/bookings', params),
  
  getBookingById: (id: string) => 
    apiService.get(`/bookings/${id}`),
  
  createBooking: (data: any) => 
    apiService.post('/bookings', data),
  
  updateBooking: (id: string, data: any) => 
    apiService.put(`/bookings/${id}`, data),
  
  checkInGuest: (id: string, data: { roomNumber: string; actualCheckInTime?: string; notes?: string }) => 
    apiService.post(`/bookings/${id}/checkin`, data),
  
  checkOutGuest: (id: string, data: { actualCheckOutTime?: string; finalAmount?: number; additionalCharges?: any[]; notes?: string }) => 
    apiService.post(`/bookings/${id}/checkout`, data),
  
  cancelBooking: (id: string, data: { reason: string; refundAmount?: number; notes?: string }) => 
    apiService.post(`/bookings/${id}/cancel`, data),
  
  getAvailableServices: () => 
    apiService.get('/bookings/services/available')
};

// Hotel API methods
export const hotelApi = {
  getAllHotels: (params?: any) => 
    apiService.get('/hotels', params),
  
  getHotelById: (id: number) => 
    apiService.get(`/hotels/${id}`),
  
  createHotel: (data: any) => 
    apiService.post('/hotels', data),
  
  updateHotel: (id: number, data: any) => 
    apiService.put(`/hotels/${id}`, data),
  
  deleteHotel: (id: number) => 
    apiService.delete(`/hotels/${id}`)
};

// Room API methods
export const roomApi = {
  getAllRooms: (params?: any) => 
    apiService.get('/rooms', params),
  
  getRoomById: (id: number) => 
    apiService.get(`/rooms/${id}`),
  
  createRoom: (data: any) => 
    apiService.post('/rooms', data),
  
  updateRoom: (id: number, data: any) => 
    apiService.put(`/rooms/${id}`, data),
  
  deleteRoom: (id: number) => 
    apiService.delete(`/rooms/${id}`)
};

// Auth API methods
export const authApi = {
  login: (data: { email: string; password: string }) => 
    apiService.post('/auth/login', data),
  
  register: (data: any) => 
    apiService.post('/auth/register', data),
  
  refreshToken: () => 
    apiService.post('/auth/refresh'),
  
  logout: () => 
    apiService.post('/auth/logout'),
  
  forgotPassword: (data: { email: string }) => 
    apiService.post('/auth/forgot-password', data),
  
  resetPassword: (data: { token: string; password: string }) => 
    apiService.post('/auth/reset-password', data)
};

export default apiService;