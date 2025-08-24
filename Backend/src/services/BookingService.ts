import { logger } from '@/utils/logger';
import { Room } from '@/models/Room';
import { RoomType } from '@/models/RoomType';
import { Booking } from '@/models/Booking';
import { JWTPayload } from '@/types/auth';
import { CreateBookingRequest, UpdateBookingRequest, BookingFilters, BookingStats } from '@/types/booking';
import { PartialModelObject } from 'objection';
import { BookingIdGenerator } from '@/utils/BookingIdGenerator';

export interface BookingRequest {
  hotel_id: number;
  room_type_id?: number;
  room_id?: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: Date;
  check_out: Date;
  guests: number;
  special_requests?: string;
}

export interface BookingCalendarQuery {
  hotel_id: number;
  start_date: Date;
  end_date: Date;
  room_type_id?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room_id: number;
  room_number: string;
  guest_name: string;
  status: string;
  color?: string;
}

export class BookingService {
  // Create a new booking
  async createBooking(bookingData: CreateBookingRequest, user?: JWTPayload): Promise<Booking> {
    try {
      // Generate booking reference using new system
      const bookingReference = await BookingIdGenerator.generateBookingId(
        bookingData.hotel_id,
        bookingData.room_id,
        undefined, // no bed_id for room bookings
        new Date(bookingData.check_in_date)
      );
      
      // Calculate nights
      const checkIn = new Date(bookingData.check_in_date);
      const checkOut = new Date(bookingData.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const insertData: PartialModelObject<Booking> = {
        booking_reference: bookingReference,
        user_id: user?.id,
        hotel_id: bookingData.hotel_id,
        room_id: bookingData.room_id,
        room_type_id: bookingData.room_type_id,
        guest_details: bookingData.guest_details,
        adults: bookingData.adults,
        children: bookingData.children || 0,
        infants: bookingData.infants || 0,
        check_in_date: checkIn,
        check_out_date: checkOut,
        nights,
        pricing: bookingData.pricing,
        payment: bookingData.payment,
        booking_source: bookingData.booking_source || 'direct',
        special_requests: bookingData.special_requests,
        status: 'pending' as const
      };
      
      const booking = await Booking.query().insert(insertData);
      return booking;
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  // Get bookings with filters and pagination
  async getBookings(
    page: number,
    limit: number,
    filters: BookingFilters,
    user?: JWTPayload
  ): Promise<{ bookings: Booking[]; total: number; pages: number }> {
    try {
      let query = Booking.query()
        .withGraphFetched('[user, hotel, room, roomType]')
        .orderBy('created_at', 'desc');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      if (filters.hotel_id) {
        query = query.where('hotel_id', filters.hotel_id);
      }
      if (filters.user_id) {
        query = query.where('user_id', filters.user_id);
      }
      if (filters.date_from) {
        query = query.where('check_in_date', '>=', filters.date_from);
      }
      if (filters.date_to) {
        query = query.where('check_out_date', '<=', filters.date_to);
      }
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        // Vendors can only see bookings for their hotels
        query = query.whereExists(
          Booking.relatedQuery('hotel').where('vendor_id', user.id)
        );
      } else if (user?.userType === 'user') {
        // Users can only see their own bookings
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
      logger.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  // Get booking by ID
  async getBookingById(id: number, user?: JWTPayload): Promise<Booking | null> {
    try {
      let query = Booking.query()
        .findById(id)
        .withGraphFetched('[user, hotel, room, roomType]');
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        query = query.whereExists(
          Booking.relatedQuery('hotel').where('vendor_id', user.id)
        );
      } else if (user?.userType === 'user') {
        query = query.where('user_id', user.id);
      }
      
      const result = await query;
      return result || null;
    } catch (error) {
      logger.error('Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  // Update booking
  async updateBooking(
    id: number,
    updateData: UpdateBookingRequest,
    user?: JWTPayload
  ): Promise<Booking> {
    try {
      const booking = await this.getBookingById(id, user);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Calculate nights if dates are updated
      let nights = booking.nights;
      if (updateData.check_in_date || updateData.check_out_date) {
        const checkIn = new Date(updateData.check_in_date || booking.check_in_date);
        const checkOut = new Date(updateData.check_out_date || booking.check_out_date);
        nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      // Create patch data with proper typing
      const patchData: any = {
        ...updateData,
        nights,
        check_in_date: updateData.check_in_date ? new Date(updateData.check_in_date) : undefined,
        check_out_date: updateData.check_out_date ? new Date(updateData.check_out_date) : undefined
      };
      
      // Remove undefined values
      Object.keys(patchData).forEach((key) => {
        if (patchData[key] === undefined) {
          delete patchData[key];
        }
      });
      
      const updatedBooking = await booking.$query().patchAndFetch(patchData);
      return updatedBooking;
    } catch (error) {
      logger.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  }

  // Cancel booking
  async cancelBooking(id: number, reason: string, user?: JWTPayload): Promise<Booking> {
    try {
      const booking = await this.getBookingById(id, user);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }
      
      const updatedBooking = await booking.$query().patchAndFetch({
        status: 'cancelled' as const,
        cancelled_at: new Date(),
        cancelled_by: user?.id,
        cancellation_reason: reason
      });
      
      return updatedBooking;
    } catch (error) {
      logger.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  // Check-in booking
  async checkInBooking(id: number, user?: JWTPayload): Promise<Booking> {
    try {
      const booking = await this.getBookingById(id, user);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      if (booking.status !== 'confirmed') {
        throw new Error('Only confirmed bookings can be checked in');
      }
      
      const updatedBooking = await booking.$query().patchAndFetch({
        status: 'checked_in' as const,
        checked_in_at: new Date()
      });
      
      return updatedBooking;
    } catch (error) {
      logger.error('Error checking in booking:', error);
      throw new Error('Failed to check in booking');
    }
  }

  // Check-out booking
  async checkOutBooking(id: number, user?: JWTPayload): Promise<Booking> {
    try {
      const booking = await this.getBookingById(id, user);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      if (booking.status !== 'checked_in') {
        throw new Error('Only checked-in bookings can be checked out');
      }
      
      const updatedBooking = await booking.$query().patchAndFetch({
        status: 'checked_out' as const,
        checked_out_at: new Date()
      });
      
      return updatedBooking;
    } catch (error) {
      logger.error('Error checking out booking:', error);
      throw new Error('Failed to check out booking');
    }
  }

  // Get booking statistics
  async getBookingStats(
    hotel_id?: number,
    date_from?: string,
    date_to?: string,
    user?: JWTPayload
  ): Promise<BookingStats> {
    try {
      let query = Booking.query();
      
      // Apply filters
      if (hotel_id) {
        query = query.where('hotel_id', hotel_id);
      }
      if (date_from) {
        query = query.where('check_in_date', '>=', date_from);
      }
      if (date_to) {
        query = query.where('check_out_date', '<=', date_to);
      }
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        query = query.whereExists(
          Booking.relatedQuery('hotel').where('vendor_id', user.id)
        );
      }
      
      const bookings = await query;
      
      const stats: BookingStats = {
        total_bookings: bookings.length,
        confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
        cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
        checked_in: bookings.filter(b => b.status === 'checked_in').length,
        checked_out: bookings.filter(b => b.status === 'checked_out').length,
        no_shows: bookings.filter(b => b.status === 'no_show').length,
        total_revenue: bookings
          .filter(b => b.status !== 'cancelled')
          .reduce((sum, b) => sum + (b.pricing as any).total_amount, 0),
        average_rate: 0,
        occupancy_rate: 0
      };
      
      if (stats.total_bookings > 0) {
        stats.average_rate = stats.total_revenue / stats.total_bookings;
      }
      
      return stats;
    } catch (error) {
      logger.error('Error fetching booking stats:', error);
      throw new Error('Failed to fetch booking statistics');
    }
  }

  // Generate unique booking reference
  // Remove old booking reference generation method
  // private generateBookingReference(): string {
  //   const timestamp = Date.now().toString(36);
  //   const random = Math.random().toString(36).substr(2, 5);
  //   return `BK${timestamp}${random}`.toUpperCase();
  // }

  // Get booking calendar data
  async getBookingCalendar(query: BookingCalendarQuery): Promise<CalendarEvent[]> {
    try {
      const { hotel_id, start_date, end_date, room_type_id } = query;

      // Note: This is a placeholder implementation
      // In a real application, you would have a bookings table
      // and query actual booking data
      
      let roomQuery = Room.query()
        .where('hotel_id', hotel_id)
        .withGraphFetched('[roomType]');

      if (room_type_id) {
        roomQuery = roomQuery.where('room_type_id', room_type_id);
      }

      const rooms = await roomQuery;
      const events: CalendarEvent[] = [];

      // Generate sample booking events for demonstration
      rooms.forEach(room => {
        // This would be replaced with actual booking queries
        const sampleBooking: CalendarEvent = {
          id: `booking-${room.id}-${Date.now()}`,
          title: `Guest Booking - Room ${room.room_number}`,
          start: start_date,
          end: end_date,
          room_id: room.id,
          room_number: room.room_number,
          guest_name: 'Sample Guest',
          status: 'confirmed',
          color: '#4CAF50'
        };
        events.push(sampleBooking);
      });

      return events;
    } catch (error) {
      logger.error('Error fetching booking calendar:', error);
      throw error;
    }
  }

  // Generate room availability report
  async getRoomAvailabilityReport(
    hotel_id: number,
    start_date: Date,
    end_date: Date
  ): Promise<any> {
    try {
      logger.info(`Generating availability report for hotel ${hotel_id} from ${start_date} to ${end_date}`);

      // Get all rooms for the hotel
      const rooms = await Room.query()
        .where('hotel_id', hotel_id)
        .withGraphFetched('roomType');

      // Get bookings for the date range
      const bookings = await Booking.query()
        .where('hotel_id', hotel_id)
        .where('check_in_date', '<=', end_date)
        .where('check_out_date', '>=', start_date)
        .where('status', 'in', ['confirmed', 'checked_in']);

      // Calculate availability for each room
      const availabilityData = rooms.map(room => {
        const roomBookings = bookings.filter(booking => booking.room_id === room.id);
        
        // Calculate occupied nights
        let occupiedNights = 0;
        roomBookings.forEach(booking => {
          const checkIn = new Date(Math.max(booking.check_in_date.getTime(), start_date.getTime()));
          const checkOut = new Date(Math.min(booking.check_out_date.getTime(), end_date.getTime()));
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          occupiedNights += Math.max(0, nights);
        });

        const totalNights = Math.ceil((end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24));
        const availableNights = totalNights - occupiedNights;
        const occupancyRate = totalNights > 0 ? (occupiedNights / totalNights) * 100 : 0;

        return {
          room_id: room.id,
          room_number: room.room_number,
          room_type: room.roomType?.name || 'Unknown',
          total_nights: totalNights,
          occupied_nights: occupiedNights,
          available_nights: availableNights,
          occupancy_rate: Math.round(occupancyRate * 100) / 100,
          bookings: roomBookings.length
        };
      });

      // Calculate summary statistics
      const totalRooms = rooms.length;
      const totalNights = availabilityData.reduce((sum, room) => sum + room.total_nights, 0);
      const totalOccupiedNights = availabilityData.reduce((sum, room) => sum + room.occupied_nights, 0);
      const overallOccupancyRate = totalNights > 0 ? (totalOccupiedNights / totalNights) * 100 : 0;

      return {
        hotel_id,
        period: {
          start_date,
          end_date
        },
        summary: {
          total_rooms: totalRooms,
          total_nights: totalNights,
          occupied_nights: totalOccupiedNights,
          available_nights: totalNights - totalOccupiedNights,
          overall_occupancy_rate: Math.round(overallOccupancyRate * 100) / 100
        },
        rooms: availabilityData
      };
    } catch (error) {
      logger.error('Error generating room availability report:', error);
      throw error;
    }
  }
}