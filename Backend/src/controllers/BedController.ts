import { Request, Response } from 'express';
import { Bed } from '@/models/Bed';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

export class BedController {
  // Get all beds for a room
  getBeds = async (req: Request, res: Response) => {
    try {
      const { room_id } = req.params;
      const beds = await Bed.query()
        .where('room_id', room_id)
        .withGraphFetched('room');
      
      ApiResponse.success(res, beds, 'Beds retrieved successfully');
    } catch (error) {
      logger.error('Get beds error:', error);
      ApiResponse.error(res, 'Failed to retrieve beds', 500);
    }
  };

  // Get single bed
  getBed = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bed = await Bed.query()
        .findById(id)
        .withGraphFetched('room');
      
      if (!bed) {
        return ApiResponse.error(res, 'Bed not found', 404);
      }
      
      ApiResponse.success(res, bed, 'Bed retrieved successfully');
    } catch (error) {
      logger.error('Get bed error:', error);
      ApiResponse.error(res, 'Failed to retrieve bed', 500);
    }
  };

  // Create new bed
  createBed = async (req: Request, res: Response) => {
    try {
      const bedData = req.body;
      const bed = await Bed.query().insert(bedData);
      
      ApiResponse.success(res, bed, 'Bed created successfully', 201);
    } catch (error) {
      logger.error('Create bed error:', error);
      ApiResponse.error(res, 'Failed to create bed', 500);
    }
  };

  // Update bed
  updateBed = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const bed = await Bed.query().patchAndFetchById(id, updateData);
      
      if (!bed) {
        return ApiResponse.error(res, 'Bed not found', 404);
      }
      
      ApiResponse.success(res, bed, 'Bed updated successfully');
    } catch (error) {
      logger.error('Update bed error:', error);
      ApiResponse.error(res, 'Failed to update bed', 500);
    }
  };

  // Delete bed
  deleteBed = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const deletedCount = await Bed.query().deleteById(id);
      
      if (deletedCount === 0) {
        return ApiResponse.error(res, 'Bed not found', 404);
      }
      
      ApiResponse.success(res, null, 'Bed deleted successfully');
    } catch (error) {
      logger.error('Delete bed error:', error);
      ApiResponse.error(res, 'Failed to delete bed', 500);
    }
  };
}