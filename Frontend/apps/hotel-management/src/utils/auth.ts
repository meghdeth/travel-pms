// Simple authentication utility without cookie complexity

export interface User {
  id: string;
  hotelId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const auth = {
  // Get user data
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = sessionStorage.getItem('hotel_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('hotel_token');
  },

  // Get hotel ID
  getHotelId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('hotel_id');
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Hotel Admin';
  },

  // Clear auth data
  logout(): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem('hotel_token');
    sessionStorage.removeItem('hotel_user');
    sessionStorage.removeItem('hotel_id');
  }
};