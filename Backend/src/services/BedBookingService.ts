import { logger } from '@/utils/logger';
import { BedBooking } from '@/models/BedBooking';
import { Bed } from '@/models/Bed';
import { Room } from '@/models/Room';
import { JWTPayload } from '@/types/auth';
import { BookingIdGenerator } from '@/utils/BookingIdGenerator';
import { PartialModelObject } from 'objection';

export interface CreateBedBookingRequest {
  hotel_id: number;
  room_id: number;
  bed_id: number;
  guest_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
  };
  check_in_date: string | Date;
  check_out_date: string | Date;
  pricing: {
    bed_rate: number;
    tax_amount: number;
    service_charge: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    meal_plan?: 'none' | 'breakfast' | 'half_board' | 'full_board';
    meal_cost?: number;
  };
  payment: {
    payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    transaction_id?: string;
    payment_gateway?: string;
    paid_amount: number;
    payment_date?: Date;
  };
  booking_source?: 'direct' | 'ota' | 'phone' | 'walk_in' | 'agent';
  special_requests?: string;
  locker_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export class BedBookingService {
  // Create a new bed booking
  async createBedBooking(bookingData: CreateBedBookingRequest, user?: JWTPayload): Promise<BedBooking> {
    try {
      // Generate booking reference using new system
      const bookingReference = await BookingIdGenerator.generateBookingId(
        bookingData.hotel_id,
        bookingData.room_id,
        bookingData.bed_id, // include bed_id for dormitory bookings
        new Date(bookingData.check_in_date)
      );
      
      // Calculate nights
      const checkIn = new Date(bookingData.check_in_date);
      const checkOut = new Date(bookingData.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const insertData: PartialModelObject<BedBooking> = {
        booking_reference: bookingReference,
        user_id: user?.id,
        hotel_id: bookingData.hotel_id,
        room_id: bookingData.room_id,
        bed_id: bookingData.bed_id,
        guest_details: bookingData.guest_details,
        check_in_date: checkIn,
        check_out_date: checkOut,
        nights,
        pricing: bookingData.pricing,
        payment: bookingData.payment,
        booking_source: bookingData.booking_source || 'direct',
        special_requests: bookingData.special_requests,
        locker_number: bookingData.locker_number,
        emergency_contact: bookingData.emergency_contact,
        emergency_phone: bookingData.emergency_phone,
        status: 'pending' as const
      };
      
      const bedBooking = await BedBooking.query().insert(insertData);
      return bedBooking;
    } catch (error) {
      logger.error('Error creating bed booking:', error);
      throw new Error('Failed to create bed booking');
    }
  }

  // Get bed bookings with filters
  async getBedBookings(
    page: number,
    limit: number,
    filters: { hotel_id?: number; status?: string; date_from?: string; date_to?: string },
    user?: JWTPayload
  ): Promise<{ bookings: BedBooking[]; total: number; pages: number }> {
    try {
      let query = BedBooking.query()
        .withGraphFetched('[user, hotel, room, bed]')
        .orderBy('created_at', 'desc');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      if (filters.hotel_id) {
        query = query.where('hotel_id', filters.hotel_id);
      }
      if (filters.date_from) {
        query = query.where('check_in_date', '>=', filters.date_from);
      }
      if (filters.date_to) {
        query = query.where('check_out_date', '<=', filters.date_to);
      }
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        query = query.whereExists(
          BedBooking.relatedQuery('hotel').where('vendor_id', user.id)
        );
      } else if (user?.userType === 'admin' && user.hotel_id) {
        query = query.where('hotel_id', user.hotel_id);
      } else if (user?.userType === 'user') {
        query = query.where('user_id', user.id);
      }
      
      const total = await query.resultSize();
      const bookings = await query.page(page - 1, limit);
      
      return {
        bookings: bookings.results,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching bed bookings:', error);
      throw new Error('Failed to fetch bed bookings');
    }
  }
}