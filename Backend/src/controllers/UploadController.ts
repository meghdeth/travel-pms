import { Request, Response } from 'express';
import { FileUploadService } from '@/services/FileUploadService';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';
import { Hotel } from '@/models/Hotel';
import { RoomType } from '@/models/RoomType';
import { Room } from '@/models/Room';
import { SharedFacility } from '@/models/SharedFacility';

const fileUploadService = new FileUploadService();

export class UploadController {
  // Upload hotel images
  uploadHotelImages = async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const { image_type = 'gallery' } = req.body; // 'featured' or 'gallery'
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return ApiResponse.error(res, 'No files uploaded', 400);
      }

      const hotel = await Hotel.query().findById(hotel_id);
      if (!hotel) {
        return ApiResponse.error(res, 'Hotel not found', 404);
      }

      const uploadedFiles = fileUploadService.formatUploadedFiles(req.files);
      
      if (image_type === 'featured' && uploadedFiles.length > 0) {
        // Update featured image
        await Hotel.query()
          .findById(hotel_id)
          .patch({ featured_image: uploadedFiles[0].url });
      } else {
        // Add to gallery images
        const currentImages = hotel.images || [];
        const newImages = [...currentImages, ...uploadedFiles.map(f => f.url)];
        
        await Hotel.query()
          .findById(hotel_id)
          .patch({ images: newImages });
      }

      ApiResponse.success(res, {
        uploaded_files: uploadedFiles,
        image_type
      }, 'Images uploaded successfully');
    } catch (error) {
      logger.error('Hotel image upload error:', error);
      ApiResponse.error(res, 'Failed to upload hotel images', 500);
    }
  };

  // Upload room type images
  uploadRoomTypeImages = async (req: Request, res: Response) => {
    try {
      const { room_type_id } = req.params;
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return ApiResponse.error(res, 'No files uploaded', 400);
      }

      const roomType = await RoomType.query().findById(room_type_id);
      if (!roomType) {
        return ApiResponse.error(res, 'Room type not found', 404);
      }

      const uploadedFiles = fileUploadService.formatUploadedFiles(req.files);
      const currentImages = roomType.images || [];
      const newImages = [...currentImages, ...uploadedFiles.map(f => f.url)];
      
      await RoomType.query()
        .findById(room_type_id)
        .patch({ images: newImages });

      ApiResponse.success(res, {
        uploaded_files: uploadedFiles
      }, 'Room type images uploaded successfully');
    } catch (error) {
      logger.error('Room type image upload error:', error);
      ApiResponse.error(res, 'Failed to upload room type images', 500);
    }
  };

  // Upload facility images
  uploadFacilityImages = async (req: Request, res: Response) => {
    try {
      const { facility_id } = req.params;
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return ApiResponse.error(res, 'No files uploaded', 400);
      }

      const facility = await SharedFacility.query().findById(facility_id);
      if (!facility) {
        return ApiResponse.error(res, 'Facility not found', 404);
      }

      const uploadedFiles = fileUploadService.formatUploadedFiles(req.files);
      
      // Add images field to facility (need to update model)
      await SharedFacility.query()
        .findById(facility_id)
        .patch({ 
          // Assuming we add an images field to SharedFacility model
          images: uploadedFiles.map(f => f.url)
        } as any);

      ApiResponse.success(res, {
        uploaded_files: uploadedFiles
      }, 'Facility images uploaded successfully');
    } catch (error) {
      logger.error('Facility image upload error:', error);
      ApiResponse.error(res, 'Failed to upload facility images', 500);
    }
  };

  // Delete image
  deleteImage = async (req: Request, res: Response) => {
    try {
      const { entity_type, entity_id, image_url } = req.body;
      
      // Remove from database based on entity type
      let entity;
      switch (entity_type) {
        case 'hotel':
          entity = await Hotel.query().findById(entity_id);
          if (entity) {
            if (entity.featured_image === image_url) {
              await Hotel.query().findById(entity_id).patch({ featured_image: undefined });
            } else {
              const images = (entity.images || []).filter((img: string) => img !== image_url);
              await Hotel.query().findById(entity_id).patch({ images });
            }
          }
          break;
        case 'room_type':
          entity = await RoomType.query().findById(entity_id);
          if (entity) {
            const images = (entity.images || []).filter((img: string) => img !== image_url);
            await RoomType.query().findById(entity_id).patch({ images });
          }
          break;
        case 'facility':
          entity = await SharedFacility.query().findById(entity_id);
          if (entity) {
            const images = ((entity as any).images || []).filter((img: string) => img !== image_url);
            await SharedFacility.query().findById(entity_id).patch({ images } as any);
          }
          break;
        default:
          return ApiResponse.error(res, 'Invalid entity type', 400);
      }

      if (!entity) {
        return ApiResponse.error(res, 'Entity not found', 404);
      }

      // Delete physical file
      const filePath = image_url.replace('/uploads/', 'uploads/');
      await fileUploadService.deleteFile(filePath);

      ApiResponse.success(res, null, 'Image deleted successfully');
    } catch (error) {
      logger.error('Image deletion error:', error);
      ApiResponse.error(res, 'Failed to delete image', 500);
    }
  };
}