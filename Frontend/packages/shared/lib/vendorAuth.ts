import { apiClient } from './api';

export interface VendorLoginData {
  email: string;
  password: string;
}

export interface VendorRegisterData {
  username: string;
  email: string;
  password: string;
  company_name: string;
  contact_person: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface VendorAuthResponse {
  user: any;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

class VendorAuthService {
  private readonly TOKEN_KEY = 'vendor_token';
  private readonly REFRESH_TOKEN_KEY = 'vendor_refresh_token';

  async login(data: VendorLoginData): Promise<VendorAuthResponse> {
    try {
      const response = await apiClient.post('/auth/vendor/login', data);
      
      if (response.data.success) {
        const authData = response.data.data;
        this.setToken(authData.token);
        this.setRefreshToken(authData.refreshToken);
        return authData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  async register(data: VendorRegisterData): Promise<VendorAuthResponse> {
    try {
      const response = await apiClient.post('/auth/vendor/register', data);
      
      if (response.data.success) {
        const authData = response.data.data;
        this.setToken(authData.token);
        this.setRefreshToken(authData.refreshToken);
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
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const vendorAuthService = new VendorAuthService();