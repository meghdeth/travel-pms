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

  // Alternative method for SSR-compatible cookie handling
  private getSSRCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift() || null;
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

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
      secure: false, // For development, set to false
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds (not milliseconds)
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

    console.log('🍪 [CookieAuth] Setting cookie:', cookieString);
    document.cookie = cookieString;
  }

  // Get cookie value - SSR compatible
  getCookie(name: string): string | null {
    if (!this.isClient) {
      console.log(`🍪 [CookieAuth] getCookie(${name}): Not on client side`);
      return null;
    }

    // Ensure document is available
    if (typeof document === 'undefined') {
      console.log(`🍪 [CookieAuth] getCookie(${name}): Document not available`);
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

  // Auth token methods - with localStorage fallback for development
  setAuthToken(token: string): void {
    this.setCookie('hotel_token', token);
    // Also store in localStorage as fallback for development
    if (this.isClient && localStorage) {
      localStorage.setItem('hotel_token_backup', token);
    }
  }

  getAuthToken(): string | null {
    // Try migration first
    this.migrateFromLocalStorage();
    let token = this.getCookie('hotel_token');
    
    // Fallback to localStorage for development
    if (!token && this.isClient && localStorage) {
      token = localStorage.getItem('hotel_token_backup');
      if (token) {
        console.log('🔍 [CookieAuth] Using token from localStorage fallback');
        // Re-set the cookie if we found token in localStorage
        this.setCookie('hotel_token', token);
      }
    }
    
    console.log('🔍 [CookieAuth] getAuthToken() result:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');
    return token;
  }

  setRefreshToken(token: string): void {
    this.setCookie('hotel_refresh_token', token);
  }

  getRefreshToken(): string | null {
    return this.getCookie('hotel_refresh_token');
  }

  setUser(user: any): void {
    this.setCookie('hotel_user', JSON.stringify(user));
    // Also store in localStorage as fallback for development
    if (this.isClient && localStorage) {
      localStorage.setItem('hotel_user_backup', JSON.stringify(user));
    }
  }

  getUser(): any {
    console.log('🔍 [CookieAuth] getUser() called');
    // Try migration first
    this.migrateFromLocalStorage();
    
    let userStr = this.getCookie('hotel_user');
    
    // Fallback to localStorage for development
    if (!userStr && this.isClient && localStorage) {
      userStr = localStorage.getItem('hotel_user_backup');
      if (userStr) {
        console.log('🔍 [CookieAuth] Using user from localStorage fallback');
        // Re-set the cookie if we found user in localStorage
        this.setCookie('hotel_user', userStr);
      }
    }
    
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
    // Also store in localStorage as fallback for development
    if (this.isClient && localStorage) {
      localStorage.setItem('hotel_data_backup', JSON.stringify(hotel));
    }
  }

  getHotel(): any {
    let hotelStr = this.getCookie('hotel_data');
    
    // Fallback to localStorage for development
    if (!hotelStr && this.isClient && localStorage) {
      hotelStr = localStorage.getItem('hotel_data_backup');
      if (hotelStr) {
        console.log('🔍 [CookieAuth] Using hotel from localStorage fallback');
        // Re-set the cookie if we found hotel in localStorage
        this.setCookie('hotel_data', hotelStr);
      }
    }
    
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
    
    // Also clear localStorage fallbacks
    if (this.isClient && localStorage) {
      localStorage.removeItem('hotel_token_backup');
      localStorage.removeItem('hotel_user_backup');
      localStorage.removeItem('hotel_data_backup');
    }
    
    // Also clear other auth tokens
    this.removeCookie('authToken');
    this.removeCookie('vendor_token');
    this.removeCookie('superAdminToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    console.log('🔍 [CookieAuth] isAuthenticated() token:', token ? 'EXISTS' : 'MISSING');
    return !!token;
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