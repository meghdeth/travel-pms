import { apiClient } from './api';
import { cookieAuthService } from './cookieAuth';

export interface HotelLoginData {
  email: string;
  password: string;
}

export interface HotelRegisterData {
  // Common fields
  email: string;
  password: string;
  phone: string;
  
  // Hotel fields
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  hotel_type: 'hotel' | 'hostel' | 'bnb' | 'dormitory' | 'resort' | 'motel';
  total_rooms?: number; // Made optional since room management is separate
  
  // Vendor hotel specific (optional)
  vendor_id?: string;
  
  // Owner/Manager details
  first_name: string;
  last_name: string;
  username?: string;
  
  // Hotel operational details (optional)
  check_in_time?: string;
  check_out_time?: string;
  description?: string;
}

export interface HotelAuthResponse {
  user: any;
  hotel?: any;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

class HotelAuthService {

  async login(email: string, password: string): Promise<HotelAuthResponse>;
  async login(data: HotelLoginData): Promise<HotelAuthResponse>;
  async login(emailOrData: string | HotelLoginData, password?: string): Promise<HotelAuthResponse> {
    const data = typeof emailOrData === 'string' 
      ? { email: emailOrData, password: password! }
      : emailOrData;
    try {
      // Transform email to identifier for backend compatibility
      const loginPayload = {
        identifier: data.email,
        password: data.password
      };
      console.log('HotelAuth - Login payload:', loginPayload);
      const response = await apiClient.post('/auth/login', { email: data.email, password: data.password });
      console.log('HotelAuth - Login response:', response.data);
      
      if (response.data.success) {
        const authData = response.data.data;
        console.log('🔐 [HotelAuth] Auth data received:', authData);
        console.log('🔐 [HotelAuth] Setting token:', authData.token);
        console.log('🔐 [HotelAuth] Setting user:', authData.user);
        console.log('🔐 [HotelAuth] Setting hotel:', authData.hotel);
        
        // Set auth data in cookies
        cookieAuthService.setAuthToken(authData.token);
        cookieAuthService.setRefreshToken(authData.refreshToken);
        cookieAuthService.setUser(authData.user);
        if (authData.hotel) {
          cookieAuthService.setHotel(authData.hotel);
        }
        
        // Verify cookies were set
        console.log('🔐 [HotelAuth] Verification - Token set:', !!cookieAuthService.getAuthToken());
        console.log('🔐 [HotelAuth] Verification - User set:', !!cookieAuthService.getUser());
        console.log('🔐 [HotelAuth] Verification - Hotel set:', !!cookieAuthService.getHotel());
        
        return authData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('HotelAuth - Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  async staffLogin(email: string, password: string): Promise<HotelAuthResponse> {
    try {
      console.log('HotelAuth - Staff login for:', email);
      const response = await apiClient.post('/auth/staff/login', { email, password });
      console.log('HotelAuth - Staff login response:', response.data);
      
      if (response.data.success) {
        const authData = response.data.data;
        console.log('🔐 [HotelAuth] Staff auth data received:', authData);
        
        // Set auth data in cookies
        cookieAuthService.setAuthToken(authData.token);
        cookieAuthService.setRefreshToken(authData.refreshToken || authData.token); // Use token as refresh if not provided
        cookieAuthService.setUser(authData.user);
        
        // Verify cookies were set
        console.log('🔐 [HotelAuth] Staff verification - Token set:', !!cookieAuthService.getAuthToken());
        console.log('🔐 [HotelAuth] Staff verification - User set:', !!cookieAuthService.getUser());
        
        return authData;
      } else {
        throw new Error(response.data.message || 'Staff login failed');
      }
    } catch (error: any) {
      console.error('HotelAuth - Staff login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Staff login failed. Please check your credentials and try again.');
    }
  }

  async register(data: HotelRegisterData): Promise<HotelAuthResponse> {
    try {
      const response = await apiClient.post('/hotel/user/register', data);
      
      if (response.data.success) {
        const authData = response.data.data;
        cookieAuthService.setAuthToken(authData.token);
        cookieAuthService.setRefreshToken(authData.refreshToken);
        cookieAuthService.setUser(authData.user);
        if (authData.hotel) {
          cookieAuthService.setHotel(authData.hotel);
        }
        return authData;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/hotel/logout');
      console.log('Logout API call successful');
    } catch (error: any) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed, but proceeding with local logout:', error?.response?.data?.message || error?.message);
    } finally {
      cookieAuthService.clearAuth();
    }
  }

  async refreshToken(): Promise<HotelAuthResponse> {
    try {
      const refreshToken = cookieAuthService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/hotel/user/refresh-token', {
        refreshToken
      });
      
      if (response.data.success) {
        const authData = response.data.data;
        cookieAuthService.setAuthToken(authData.token);
        cookieAuthService.setRefreshToken(authData.refreshToken);
        cookieAuthService.setUser(authData.user);
        return authData;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error: any) {
      cookieAuthService.clearAuth();
      throw new Error('Session expired. Please login again.');
    }
  }

  getToken(): string | null {
    return cookieAuthService.getAuthToken();
  }

  setToken(token: string): void {
    cookieAuthService.setAuthToken(token);
  }

  getRefreshToken(): string | null {
    return cookieAuthService.getRefreshToken();
  }

  setRefreshToken(token: string): void {
    cookieAuthService.setRefreshToken(token);
  }

  getUser(): any {
    const user = cookieAuthService.getUser();
    console.log('🔍 [HotelAuth] Getting user from cookies:', user);
    console.log('🔍 [HotelAuth] User role structure:', user?.role);
    return user;
  }

  setUser(user: any): void {
    console.log('🔍 [HotelAuth] Storing user:', user);
    console.log('🔍 [HotelAuth] User role being stored:', user?.role);
    cookieAuthService.setUser(user);
    console.log('🔍 [HotelAuth] User stored successfully in cookies');
  }

  getHotel(): any {
    const hotel = cookieAuthService.getHotel();
    console.log('HotelAuth - getHotel: hotel from cookies:', hotel);
    return hotel;
  }

  setHotel(hotel: any): void {
    console.log('HotelAuth - setHotel called with:', hotel);
    cookieAuthService.setHotel(hotel);
    console.log('HotelAuth - Hotel stored in cookies');
  }

  clearTokens(): void {
    cookieAuthService.clearAuth();
  }

  isAuthenticated(): boolean {
    return cookieAuthService.isAuthenticated();
  }

  getHotelId(): string | null {
    return cookieAuthService.getHotelId();
  }

  getUserRole(): string | null {
    return cookieAuthService.getUserRole();
  }

  hasPermission(permission: string): boolean {
    return cookieAuthService.hasPermission(permission);
  }

  handleInvalidToken(): void {
    console.log('🔒 [HotelAuth] Invalid token detected, clearing authentication data');
    cookieAuthService.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export const hotelAuthService = new HotelAuthService();