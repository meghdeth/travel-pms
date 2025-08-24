import { Request, Response } from 'express';
import { Hotel } from '@/models/Hotel';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

export class HotelController {
  // Get all hotels for a vendor
  getHotels = async (req: Request, res: Response) => {
    try {
      const { vendor_id } = req.params;
      const hotels = await Hotel.query().where('vendor_id', vendor_id);
      
      ApiResponse.success(res, hotels, 'Hotels retrieved successfully');
    } catch (error) {
      logger.error('Get hotels error:', error);
      ApiResponse.error(res, 'Failed to retrieve hotels', 500);
    }
  };

  // Get single hotel
  getHotel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hotel = await Hotel.query()
        .findById(id)
        .withGraphFetched('[roomTypes, rooms]');
      
      if (!hotel) {
        return ApiResponse.error(res, 'Hotel not found', 404);
      }
      
      ApiResponse.success(res, hotel, 'Hotel retrieved successfully');
    } catch (error) {
      logger.error('Get hotel error:', error);
      ApiResponse.error(res, 'Failed to retrieve hotel', 500);
    }
  };

  // Create new hotel
  createHotel = async (req: Request, res: Response) => {
    try {
      const hotelData = req.body;
      const hotel = await Hotel.query().insert(hotelData);
      
      ApiResponse.success(res, hotel, 'Hotel created successfully', 201);
    } catch (error) {
      logger.error('Create hotel error:', error);
      ApiResponse.error(res, 'Failed to create hotel', 500);
    }
  };

  // Update hotel
  updateHotel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const hotel = await Hotel.query().patchAndFetchById(id, updateData);
      
      if (!hotel) {
        return ApiResponse.error(res, 'Hotel not found', 404);
      }
      
      ApiResponse.success(res, hotel, 'Hotel updated successfully');
    } catch (error) {
      logger.error('Update hotel error:', error);
      ApiResponse.error(res, 'Failed to update hotel', 500);
    }
  };

  // Delete hotel
  deleteHotel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const deletedCount = await Hotel.query().deleteById(id);
      
      if (deletedCount === 0) {
        return ApiResponse.error(res, 'Hotel not found', 404);
      }
      
      ApiResponse.success(res, null, 'Hotel deleted successfully');
    } catch (error) {
      logger.error('Delete hotel error:', error);
      ApiResponse.error(res, 'Failed to delete hotel', 500);
    }
  };
}