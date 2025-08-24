import { Hotel } from '@/models/Hotel';
import { RoomType } from '@/models/RoomType';
import { Room } from '@/models/Room';
import { Bed } from '@/models/Bed';
import { logger } from '@/utils/logger';
import { QueryBuilder } from 'objection';

export interface HotelSearchFilters {
  vendor_id?: number;
  status?: string;
  city?: string;
  country?: string;
  rating?: number;
}

export interface RoomAvailabilityQuery {
  hotel_id: number;
  check_in: Date;
  check_out: Date;
  guests?: number;
  room_type_id?: number;
}

export interface RoomAvailabilityResult {
  room_type_id: number;
  room_type_name: string;
  available_rooms: number;
  base_price: number;
  max_occupancy: number;
  rooms: Array<{
    id: number;
    room_number: string;
    floor_number: number; // Keep as number, but handle undefined in mapping
    beds: Array<{
      id: number;
      bed_number: string;
      bed_type: string;
    }>;
  }>;
}

export class HotelService {
  // Get hotels with filters and pagination
  async getHotels(filters: HotelSearchFilters = {}, page = 1, limit = 10) {
    try {
      let query = Hotel.query().withGraphFetched('[vendor, roomTypes, rooms]');

      // Apply filters
      if (filters.vendor_id) {
        query = query.where('vendor_id', filters.vendor_id);
      }
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      if (filters.city) {
        query = query.where('city', 'ilike', `%${filters.city}%`);
      }
      if (filters.country) {
        query = query.where('country', 'ilike', `%${filters.country}%`);
      }
      if (filters.rating) {
        query = query.where('rating', '>=', filters.rating);
      }

      // Pagination
      const offset = (page - 1) * limit;
      const results = await query.page(offset, limit);

      return {
        hotels: results.results,
        pagination: {
          page,
          limit,
          total: results.total,
          pages: Math.ceil(results.total / limit)
        }
      };
    } catch (error) {
      logger.error('Get hotels error:', error);
      throw new Error('Failed to retrieve hotels');
    }
  }

  // Get hotel with full details
  async getHotelDetails(hotelId: number) {
    try {
      const hotel = await Hotel.query()
        .findById(hotelId)
        .withGraphFetched('vendor, roomTypes.[rooms.[beds]]');
  
      if (!hotel) {
        throw new Error('Hotel not found');
      }
  
      return hotel;
    } catch (error) {
      logger.error('Get hotel details error:', error);
      throw error;
    }
  }

  // Create hotel with initial setup
  async createHotel(hotelData: Partial<Hotel>) {
    try {
      const hotel = await Hotel.query().insert({
        ...hotelData,
        status: hotelData.status || 'active'
      });
  
      logger.info(`Hotel created: ${hotel.name} (ID: ${hotel.id})`);
      return hotel;
    } catch (error) {
      logger.error('Create hotel error:', error);
      throw new Error('Failed to create hotel');
    }
  }

  // Update hotel
  async updateHotel(hotelId: number, updateData: Partial<Hotel>) {
    try {
      const hotel = await Hotel.query().patchAndFetchById(hotelId, updateData);
  
      if (!hotel) {
        throw new Error('Hotel not found');
      }
  
      logger.info(`Hotel updated: ${hotel.name} (ID: ${hotel.id})`);
      return hotel;
    } catch (error) {
      logger.error('Update hotel error:', error);
      throw error;
    }
  }

  // Delete hotel (soft delete by setting status to inactive)
  async deleteHotel(hotelId: number) {
    try {
      const hotel = await Hotel.query().patchAndFetchById(hotelId, {
        status: 'inactive'
      });
  
      if (!hotel) {
        throw new Error('Hotel not found');
      }
  
      logger.info(`Hotel deleted: ${hotel.name} (ID: ${hotel.id})`);
      return true;
    } catch (error) {
      logger.error('Delete hotel error:', error);
      throw error;
    }
  }

  // Check room availability for given dates
  async checkRoomAvailability(query: RoomAvailabilityQuery): Promise<RoomAvailabilityResult[]> {
    try {
      const { hotel_id, check_in, check_out, guests, room_type_id } = query;
  
      let roomTypeQuery = RoomType.query()
        .where('hotel_id', hotel_id)
        .where('status', 'active')
        .withGraphFetched('rooms.[beds]');
  
      if (room_type_id) {
        roomTypeQuery = roomTypeQuery.where('id', room_type_id);
      }
  
      if (guests) {
        roomTypeQuery = roomTypeQuery.where('max_occupancy', '>=', guests);
      }
  
      const roomTypes = await roomTypeQuery;
  
      const availabilityResults: RoomAvailabilityResult[] = [];
  
      for (const roomType of roomTypes) {
        // Filter available rooms (not booked for the given dates)
        // Note: This is a simplified version. In production, you'd check against a bookings table
        const availableRooms = roomType.rooms?.filter((room: Room) => 
          room.status === 'available'
        ) || [];
  
        if (availableRooms.length > 0) {
          availabilityResults.push({
            room_type_id: roomType.id,
            room_type_name: roomType.name,
            available_rooms: availableRooms.length,
            base_price: roomType.base_price,
            max_occupancy: roomType.max_occupancy,
            rooms: availableRooms.map((room: Room) => ({
              id: room.id,
              room_number: room.room_number,
              floor_number: room.floor_number ?? 0, // Provide default value of 0 if undefined
              beds: room.beds?.map((bed: any) => ({
                id: bed.id,
                bed_number: bed.bed_number,
                bed_type: bed.bed_type
              })) || []
            }))
          });
        }
      }
  
      return availabilityResults;
    } catch (error) {
      logger.error('Check room availability error:', error);
      throw new Error('Failed to check room availability');
    }
  }

  // Get hotel statistics
  async getHotelStatistics(hotelId: string | number) {
    try {
      // Handle both string hotel_id and numeric id
      const hotel = typeof hotelId === 'string' 
        ? await Hotel.query()
            .where('hotel_id', hotelId)
            .withGraphFetched('[roomTypes, rooms]')
            .first()
        : await Hotel.query()
            .findById(hotelId)
            .withGraphFetched('[roomTypes, rooms]');
  
      if (!hotel) {
        throw new Error('Hotel not found');
      }
  
      // Get today's date for check-ins/check-outs
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's bookings (you'll need to implement this)
      const todayCheckIns = 0; // await bookingService.getTodayCheckIns(hotelId);
      const todayCheckOuts = 0; // await bookingService.getTodayCheckOuts(hotelId);
      const monthlyRevenue = 0; // await bookingService.getMonthlyRevenue(hotelId);
      const pendingBookings = 0; // await bookingService.getPendingBookings(hotelId);
  
      const totalRooms = hotel.rooms?.length || 0;
      const availableRooms = hotel.rooms?.filter(room => room.status === 'available').length || 0;
      const occupiedRooms = hotel.rooms?.filter(room => room.status === 'occupied').length || 0;
      const maintenanceRooms = hotel.rooms?.filter(room => room.status === 'maintenance').length || 0;
  
      return {
        hotel_id: hotelId,
        hotel_name: hotel.name,
        total_rooms: totalRooms,
        available_rooms: availableRooms,
        occupied_rooms: occupiedRooms,
        maintenance_rooms: maintenanceRooms,
        occupancy_rate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
        today_check_ins: todayCheckIns,
        today_check_outs: todayCheckOuts,
        monthly_revenue: monthlyRevenue,
        pending_bookings: pendingBookings
      };
    } catch (error) {
      logger.error('Get hotel statistics error:', error);
      throw error;
    }
  }
}