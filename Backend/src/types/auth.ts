import { Request } from 'express';

export interface LoginRequest {
  email: string;
  password: string;
  userType: 'user' | 'vendor' | 'admin' | 'super_admin' | 'hotel_user';
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  contact_number?: string;
  userType: 'user' | 'vendor';
}

export interface HotelUserLoginRequest {
  email: string;
  password: string;
  hotel_id?: string; // Optional for admin login
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    hotel?: any;
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface JWTPayload {
  id: number;
  email: string;
  userType: 'user' | 'vendor' | 'admin' | 'super_admin' | 'hotel_user';
  permissions?: string[];
  vendor_id?: number | null;
  hotel_id?: number | string | null; // Updated to support both number and string
  iat: number;
  exp: number;
}

// Hotel-specific JWT payload
export interface HotelJWTPayload extends Omit<JWTPayload, 'hotel_id'> {
  hotel_user_id: string;
  hotel_id: string; // Always string for hotel users
  role: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';
  permissions: string[];
}

// Fixed AuthRequest interface that properly extends Express Request
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Hotel-specific auth request
export interface HotelAuthRequest extends Request {
  hotelUser?: HotelJWTPayload;
  hotel?: any;
}