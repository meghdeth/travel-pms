// Cookie-based authentication utility to replace localStorage
// This solves SSR issues by working on both client and server side

interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class CookieAuthService {
  private isClient = typeof window !== 'undefined';

  // Migration utility to move from localStorage to cookies
  private migrateFromLocalStorage(): void {
    if (!this.isClient) return;

    try {
      // Check if we have tokens in localStorage but not in cookies
      const localStorageToken = localStorage.getItem('hotel_token');
      const cookieToken = this.getCookie('hotel_token');

      if (localStorageToken && !cookieToken) {
        console.log('🔄 [CookieAuth] Migrating from localStorage to cookies');
        
        // Migrate token
        this.setCookie('hotel_token', localStorageToken);
        
        // Migrate refresh token
        const refreshToken = localStorage.getItem('hotel_refresh_token');
        if (refreshToken) {
          this.setCookie('hotel_refresh_token', refreshToken);
        }
        
        // Migrate user data
        const userData = localStorage.getItem('hotel_user');
        if (userData) {
          this.setCookie('hotel_user', userData);
        }
        
        // Migrate hotel data
        const hotelData = localStorage.getItem('hotel_data');
        if (hotelData) {
          this.setCookie('hotel_data', hotelData);
        }
        
        // Clear localStorage after successful migration
        localStorage.removeItem('hotel_token');
        localStorage.removeItem('hotel_refresh_token');
        localStorage.removeItem('hotel_user');
        localStorage.removeItem('hotel_data');
        
        console.log('✅ [CookieAuth] Migration completed successfully');
      }
    } catch (error) {
      console.error('❌ [CookieAuth] Migration failed:', error);
    }
  }

  // Set cookie with proper options
  setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (!this.isClient) return;

    const defaultOptions: CookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...options
    };

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (defaultOptions.expires) {
      cookieString += `; expires=${defaultOptions.expires.toUTCString()}`;
    }
    if (defaultOptions.maxAge) {
      cookieString += `; max-age=${defaultOptions.maxAge}`;
    }
    if (defaultOptions.path) {
      cookieString += `; path=${defaultOptions.path}`;
    }
    if (defaultOptions.domain) {
      cookieString += `; domain=${defaultOptions.domain}`;
    }
    if (defaultOptions.secure) {
      cookieString += '; secure';
    }
    if (defaultOptions.sameSite) {
      cookieString += `; samesite=${defaultOptions.sameSite}`;
    }

    document.cookie = cookieString;
  }

  // Get cookie value
  getCookie(name: string): string | null {
    if (!this.isClient) {
      console.log(`🍪 [CookieAuth] getCookie(${name}): Not on client side`);
      return null;
    }

    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    console.log(`🍪 [CookieAuth] getCookie(${name}): All cookies:`, document.cookie);
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
        console.log(`🍪 [CookieAuth] getCookie(${name}): Found value:`, value);
        return value;
      }
    }
    console.log(`🍪 [CookieAuth] getCookie(${name}): Not found`);
    return null;
  }

  // Remove cookie
  removeCookie(name: string, path: string = '/'): void {
    if (!this.isClient) return;
    this.setCookie(name, '', { expires: new Date(0), path });
  }

  // Auth token methods
  setAuthToken(token: string): void {
    this.setCookie('hotel_token', token);
  }

  getAuthToken(): string | null {
    // Try migration first
    this.migrateFromLocalStorage();
    return this.getCookie('hotel_token');
  }

  setRefreshToken(token: string): void {
    this.setCookie('hotel_refresh_token', token);
  }

  getRefreshToken(): string | null {
    return this.getCookie('hotel_refresh_token');
  }

  setUser(user: any): void {
    this.setCookie('hotel_user', JSON.stringify(user));
  }

  getUser(): any {
    console.log('🔍 [CookieAuth] getUser() called');
    // Try migration first
    this.migrateFromLocalStorage();
    
    const userStr = this.getCookie('hotel_user');
    console.log('🔍 [CookieAuth] getUser() userStr:', userStr);
    if (!userStr) {
      console.log('🔍 [CookieAuth] getUser() returning null - no userStr');
      return null;
    }
    
    try {
      const parsed = JSON.parse(userStr);
      console.log('🔍 [CookieAuth] getUser() parsed user:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ [CookieAuth] Error parsing user from cookie:', error);
      return null;
    }
  }

  setHotel(hotel: any): void {
    this.setCookie('hotel_data', JSON.stringify(hotel));
  }

  getHotel(): any {
    const hotelStr = this.getCookie('hotel_data');
    if (!hotelStr) return null;
    
    try {
      return JSON.parse(hotelStr);
    } catch (error) {
      console.error('Error parsing hotel from cookie:', error);
      return null;
    }
  }

  // Clear all auth cookies
  clearAuth(): void {
    this.removeCookie('hotel_token');
    this.removeCookie('hotel_refresh_token');
    this.removeCookie('hotel_user');
    this.removeCookie('hotel_data');
    
    // Also clear other auth tokens
    this.removeCookie('authToken');
    this.removeCookie('vendor_token');
    this.removeCookie('superAdminToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get hotel ID
  getHotelId(): string | null {
    const hotel = this.getHotel();
    return hotel?.hotel_id || hotel?.id?.toString() || null;
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role?.name || null;
  }

  // Check permissions
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    const permissions = user?.role?.permissions || [];
    return permissions.includes(permission) || permissions.includes('*');
  }
}

export const cookieAuthService = new CookieAuthService();
export default cookieAuthService;