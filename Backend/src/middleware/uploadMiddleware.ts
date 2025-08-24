import { Request, Response, NextFunction } from 'express';
import { FileUploadService } from '@/services/FileUploadService';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

const fileUploadService = new FileUploadService();

export const createUploadMiddleware = (uploadType: 'hotels' | 'rooms' | 'room-types' | 'facilities') => {
  const upload = fileUploadService.getMulterConfig(uploadType);
  
  return {
    single: (fieldName: string) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, async (err) => {
          if (err) {
            logger.error('File upload error:', err);
            return ApiResponse.error(res, err.message, 400);
          }
          
          if (req.file) {
            try {
              const { processedPath, thumbnailPath } = await fileUploadService.processImage(
                req.file.path,
                {
                  width: 1200,
                  height: 800,
                  createThumbnail: true
                }
              );
              
              req.file.path = processedPath;
              req.file.filename = processedPath.split('/').pop() || req.file.filename;
              
              if (thumbnailPath) {
                (req.file as any).thumbnailPath = thumbnailPath;
              }
            } catch (error) {
              logger.error('Image processing error:', error);
              return ApiResponse.error(res, 'Failed to process image', 500);
            }
          }
          
          next();
        });
      };
    },
    
    multiple: (fieldName: string, maxCount: number = 10) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        upload.array(fieldName, maxCount)(req, res, async (err) => {
          if (err) {
            logger.error('Multiple file upload error:', err);
            return ApiResponse.error(res, err.message, 400);
          }
          
          if (req.files && Array.isArray(req.files)) {
            try {
              const processedFiles = [];
              
              for (const file of req.files) {
                const { processedPath, thumbnailPath } = await fileUploadService.processImage(
                  file.path,
                  {
                    width: 1200,
                    height: 800,
                    createThumbnail: true
                  }
                );
                
                file.path = processedPath;
                file.filename = processedPath.split('/').pop() || file.filename;
                
                if (thumbnailPath) {
                  (file as any).thumbnailPath = thumbnailPath;
                }
                
                processedFiles.push(file);
              }
              
              req.files = processedFiles;
            } catch (error) {
              logger.error('Multiple image processing error:', error);
              return ApiResponse.error(res, 'Failed to process images', 500);
            }
          }
          
          next();
        });
      };
    }
  };
};

export const hotelUpload = createUploadMiddleware('hotels');
export const roomUpload = createUploadMiddleware('rooms');
export const roomTypeUpload = createUploadMiddleware('room-types');
export const facilityUpload = createUploadMiddleware('facilities');