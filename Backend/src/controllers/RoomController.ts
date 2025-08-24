import { Request, Response } from 'express';
import { Room } from '@/models/Room';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

export class RoomController {
  // Get all rooms for a hotel
  getRooms = async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const rooms = await Room.query()
        .where('hotel_id', hotel_id)
        .withGraphFetched('[roomType, beds]');
      
      ApiResponse.success(res, rooms, 'Rooms retrieved successfully');
    } catch (error) {
      logger.error('Get rooms error:', error);
      ApiResponse.error(res, 'Failed to retrieve rooms', 500);
    }
  };

  // Get rooms by room type
  getRoomsByType = async (req: Request, res: Response) => {
    try {
      const { room_type_id } = req.params;
      const rooms = await Room.query()
        .where('room_type_id', room_type_id)
        .withGraphFetched('[roomType, beds]');
      
      ApiResponse.success(res, rooms, 'Rooms retrieved successfully');
    } catch (error) {
      logger.error('Get rooms by type error:', error);
      ApiResponse.error(res, 'Failed to retrieve rooms', 500);
    }
  };

  // Get single room
  getRoom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const room = await Room.query()
        .findById(id)
        .withGraphFetched('[hotel, roomType, beds]');
      
      if (!room) {
        return ApiResponse.error(res, 'Room not found', 404);
      }
      
      ApiResponse.success(res, room, 'Room retrieved successfully');
    } catch (error) {
      logger.error('Get room error:', error);
      ApiResponse.error(res, 'Failed to retrieve room', 500);
    }
  };

  // Create new room
  createRoom = async (req: Request, res: Response) => {
    try {
      const roomData = req.body;
      const room = await Room.query().insert(roomData);
      
      ApiResponse.success(res, room, 'Room created successfully', 201);
    } catch (error) {
      logger.error('Create room error:', error);
      ApiResponse.error(res, 'Failed to create room', 500);
    }
  };

  // Update room
  updateRoom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const room = await Room.query().patchAndFetchById(id, updateData);
      
      if (!room) {
        return ApiResponse.error(res, 'Room not found', 404);
      }
      
      ApiResponse.success(res, room, 'Room updated successfully');
    } catch (error) {
      logger.error('Update room error:', error);
      ApiResponse.error(res, 'Failed to update room', 500);
    }
  };

  // Delete room
  deleteRoom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const deletedCount = await Room.query().deleteById(id);
      
      if (deletedCount === 0) {
        return ApiResponse.error(res, 'Room not found', 404);
      }
      
      ApiResponse.success(res, null, 'Room deleted successfully');
    } catch (error) {
      logger.error('Delete room error:', error);
      ApiResponse.error(res, 'Failed to delete room', 500);
    }
  };
}