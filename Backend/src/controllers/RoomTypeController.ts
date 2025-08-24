import { Request, Response } from 'express';
import { RoomType } from '@/models/RoomType';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

export class RoomTypeController {
  // Get all room types for a hotel
  getRoomTypes = async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const roomTypes = await RoomType.query()
        .where('hotel_id', hotel_id)
        .withGraphFetched('rooms');
      
      ApiResponse.success(res, roomTypes, 'Room types retrieved successfully');
    } catch (error) {
      logger.error('Get room types error:', error);
      ApiResponse.error(res, 'Failed to retrieve room types', 500);
    }
  };

  // Get single room type
  getRoomType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const roomType = await RoomType.query()
        .findById(id)
        .withGraphFetched('[hotel, rooms]');
      
      if (!roomType) {
        return ApiResponse.error(res, 'Room type not found', 404);
      }
      
      ApiResponse.success(res, roomType, 'Room type retrieved successfully');
    } catch (error) {
      logger.error('Get room type error:', error);
      ApiResponse.error(res, 'Failed to retrieve room type', 500);
    }
  };

  // Create new room type
  createRoomType = async (req: Request, res: Response) => {
    try {
      const roomTypeData = req.body;
      const roomType = await RoomType.query().insert(roomTypeData);
      
      ApiResponse.success(res, roomType, 'Room type created successfully', 201);
    } catch (error) {
      logger.error('Create room type error:', error);
      ApiResponse.error(res, 'Failed to create room type', 500);
    }
  };

  // Update room type
  updateRoomType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const roomType = await RoomType.query().patchAndFetchById(id, updateData);
      
      if (!roomType) {
        return ApiResponse.error(res, 'Room type not found', 404);
      }
      
      ApiResponse.success(res, roomType, 'Room type updated successfully');
    } catch (error) {
      logger.error('Update room type error:', error);
      ApiResponse.error(res, 'Failed to update room type', 500);
    }
  };

  // Delete room type
  deleteRoomType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const deletedCount = await RoomType.query().deleteById(id);
      
      if (deletedCount === 0) {
        return ApiResponse.error(res, 'Room type not found', 404);
      }
      
      ApiResponse.success(res, null, 'Room type deleted successfully');
    } catch (error) {
      logger.error('Delete room type error:', error);
      ApiResponse.error(res, 'Failed to delete room type', 500);
    }
  };
}