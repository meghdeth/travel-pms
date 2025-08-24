// Shared TypeScript interfaces and types for all microservices

// User related types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'vendor' | 'hotel_manager' | 'hotel_staff' | 'customer';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

// Vendor related types
export interface Vendor {
  id: number;
  userId: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt?: string;
}

// Hotel related types
export interface Hotel {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive' | 'deleted';
  createdAt: string;
  updatedAt?: string;
}

// Room related types
export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order' | 'deleted';
  createdAt: string;
  updatedAt?: string;
}

// Booking related types
export interface Booking {
  id: number;
  userId: number;
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingRequest {
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

// Search related types
export interface RoomSearchQuery {
  location?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  roomType?: string;
}

export interface RoomSearchResult extends Room {
  hotelName: string;
  hotelLocation: string;
  hotelRating: number;
  available: boolean;
  totalPrice: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface ServiceResponse<T = any> extends ApiResponse<T> {}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Payment related types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethodId: string;
}

// Statistics and Analytics types
export interface ServiceStats {
  total: number;
  active: number;
  pending: number;
  suspended?: number;
  inactive?: number;
}

export interface HotelAnalytics {
  totalHotels: number;
  newHotelsThisMonth: number;
  activeHotels: number;
  totalRooms: number;
  occupancyRate: number;
  topPerformingHotels: Array<{
    id: number;
    name: string;
    occupancy: number;
  }>;
}

export interface BookingAnalytics {
  totalBookings: number;
  newBookingsThisMonth: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
  topDestinations: Array<{
    city: string;
    bookings: number;
  }>;
}

// File upload types
export interface UploadedFile {
  filename: string;
  originalname: string;
  path: string;
  size: number;
}

export interface FileUploadResponse {
  files: UploadedFile[];
}

// Socket.IO event types
export interface SocketEvents {
  // Hotel service events
  'room-status-update': {
    hotelId: number;
    roomId: number;
    status: string;
  };
  'room-status-changed': {
    hotelId: number;
    roomId: number;
    status: string;
  };
  
  // Booking service events
  'booking-created': {
    bookingId: number;
    hotelId: number;
    roomId: number;
  };
  'booking-updated': {
    bookingId: number;
    status: string;
  };
  'booking-cancelled': {
    bookingId: number;
    reason?: string;
  };
  
  // Vendor service events
  'vendor-status-changed': {
    vendorId: number;
    status: string;
  };
}

// Error types
export interface ServiceError extends Error {
  statusCode?: number;
  code?: string | number;
  service?: string;
}

// Inter-service communication types
export interface ServiceRequest<T = any> {
  service: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: T;
  headers?: Record<string, string>;
}

export interface InterServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}