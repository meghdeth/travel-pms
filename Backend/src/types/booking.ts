import { JWTPayload } from './auth';

export interface BookingGuest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  id_type?: 'passport' | 'driving_license' | 'national_id';
  id_number?: string;
}

export interface BookingPricing {
  room_rate: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  rate_plan?: string;
  promotional_code?: string;
}

export interface BookingPayment {
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  transaction_id?: string;
  payment_gateway?: string;
  paid_amount: number;
  payment_date?: Date;
  refund_amount?: number;
  refund_date?: Date;
}

export interface CreateBookingRequest {
  hotel_id: number;
  room_id: number;
  room_type_id: number;
  guest_details: BookingGuest;
  adults: number;
  children?: number;
  infants?: number;
  check_in_date: string | Date;
  check_out_date: string | Date;
  pricing: BookingPricing;
  payment: BookingPayment;
  booking_source?: 'direct' | 'ota' | 'phone' | 'walk_in' | 'agent';
  special_requests?: string;
}

export interface UpdateBookingRequest {
  guest_details?: Partial<BookingGuest>;
  adults?: number;
  children?: number;
  infants?: number;
  check_in_date?: string | Date;
  check_out_date?: string | Date;
  pricing?: Partial<BookingPricing>;
  payment?: Partial<BookingPayment>;
  status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  special_requests?: string;
  internal_notes?: string;
}

export interface BookingFilters {
  status?: string;
  hotel_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  checked_in: number;
  checked_out: number;
  no_shows: number;
  total_revenue: number;
  average_rate: number;
  occupancy_rate: number;
}