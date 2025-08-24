export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'vendor' | 'hotel_manager' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  vendorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}