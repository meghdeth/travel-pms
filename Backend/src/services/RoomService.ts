import { Room } from '@/models/Room';
import { RoomType } from '@/models/RoomType';
import { Bed } from '@/models/Bed';
import { logger } from '@/utils/logger';

export interface RoomFilters {
  hotel_id?: number;
  room_type_id?: number;
  floor_number?: number;
  status?: string;
}

export interface BulkRoomCreation {
  hotel_id: number;
  room_type_id: number;
  floor_number: number;
  room_numbers: string[];
  beds_per_room?: Array<{
    bed_type: string;
    quantity: number;
  }>;
}

export class RoomService {
  // Get rooms with filters
  async getRooms(filters: RoomFilters = {}) {
    try {
      let query = Room.query().withGraphFetched('[hotel, roomType, beds]');

      if (filters.hotel_id) {
        query = query.where('hotel_id', filters.hotel_id);
      }
      if (filters.room_type_id) {
        query = query.where('room_type_id', filters.room_type_id);
      }
      if (filters.floor_number) {
        query = query.where('floor_number', filters.floor_number);
      }
      if (filters.status) {
        query = query.where('status', filters.status);
      }

      const rooms = await query.orderBy(['floor_number', 'room_number']);
      return rooms;
    } catch (error) {
      logger.error('Get rooms error:', error);
      throw new Error('Failed to retrieve rooms');
    }
  }

  // Create single room
  async createRoom(roomData: Partial<Room>) {
    try {
      // Check if room number already exists in the hotel
      const existingRoom = await Room.query()
        .where('hotel_id', roomData.hotel_id!)
        .where('room_number', roomData.room_number!)
        .first();

      if (existingRoom) {
        throw new Error(`Room ${roomData.room_number} already exists in this hotel`);
      }

      const room = await Room.query().insert({
        ...roomData,
        status: roomData.status || 'available'
        // Remove created_at and updated_at - BaseModel handles these automatically
      });

      logger.info(`Room created: ${room.room_number} (ID: ${room.id})`);
      return room;
    } catch (error) {
      logger.error('Create room error:', error);
      throw error;
    }
  }

  // Bulk create rooms
  async bulkCreateRooms(bulkData: BulkRoomCreation) {
    try {
      const { hotel_id, room_type_id, floor_number, room_numbers, beds_per_room } = bulkData;

      // Check for existing room numbers
      const existingRooms = await Room.query()
        .where('hotel_id', hotel_id)
        .whereIn('room_number', room_numbers);

      if (existingRooms.length > 0) {
        const existingNumbers = existingRooms.map(room => room.room_number);
        throw new Error(`Rooms already exist: ${existingNumbers.join(', ')}`);
      }

      const createdRooms = [];

      // Create rooms in transaction
      for (const room_number of room_numbers) {
        const room = await Room.query().insert({
          hotel_id,
          room_type_id,
          room_number,
          floor_number,
          status: 'available' as const
          // Remove timestamps - BaseModel handles these
        });

        // Create beds if specified
        if (beds_per_room && beds_per_room.length > 0) {
          let bedNumber = 1;
          for (const bedConfig of beds_per_room) {
            for (let i = 0; i < bedConfig.quantity; i++) {
              await Bed.query().insert({
                room_id: room.id,
                bed_number: bedNumber.toString(),
                bed_type: bedConfig.bed_type as 'single' | 'double' | 'queen' | 'king' | 'bunk',
                status: 'available' as const
                // Remove timestamps - BaseModel handles these
              });
              bedNumber++;
            }
          }
        }

        createdRooms.push(room);
      }

      logger.info(`Bulk created ${createdRooms.length} rooms on floor ${floor_number}`);
      return createdRooms;
    } catch (error) {
      logger.error('Bulk create rooms error:', error);
      throw error;
    }
  }

  // Update room status
  async updateRoomStatus(roomId: number, status: string) {
    try {
      const room = await Room.query().patchAndFetchById(roomId, {
        status: status as 'available' | 'occupied' | 'maintenance' | 'out_of_order'
        // Remove updated_at - BaseModel handles this automatically
      });

      if (!room) {
        throw new Error('Room not found');
      }

      logger.info(`Room status updated: ${room.room_number} -> ${status}`);
      return room;
    } catch (error) {
      logger.error('Update room status error:', error);
      throw error;
    }
  }

  // Get room occupancy by floor
  async getRoomOccupancyByFloor(hotelId: number) {
    try {
      const rooms = await Room.query()
        .where('hotel_id', hotelId)
        .orderBy(['floor_number', 'room_number']);

      const floorOccupancy: Record<number, any> = {};

      rooms.forEach(room => {
        // Handle optional floor_number with default value
        const floorNum = room.floor_number ?? 0;
        
        if (!floorOccupancy[floorNum]) {
          floorOccupancy[floorNum] = {
            floor_number: floorNum,
            total_rooms: 0,
            available: 0,
            occupied: 0,
            maintenance: 0,
            out_of_order: 0
          };
        }

        floorOccupancy[floorNum].total_rooms++;
        floorOccupancy[floorNum][room.status]++;
      });

      return Object.values(floorOccupancy);
    } catch (error) {
      logger.error('Get room occupancy by floor error:', error);
      throw new Error('Failed to get room occupancy data');
    }
  }
}