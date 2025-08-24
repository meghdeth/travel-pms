import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import { logger } from '@/utils/logger';

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  createThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
}

export class FileUploadService {
  private uploadDir = 'uploads';
  private allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.ensureUploadDirectories();
  }

  private async ensureUploadDirectories() {
    const directories = [
      `${this.uploadDir}/hotels`,
      `${this.uploadDir}/rooms`,
      `${this.uploadDir}/room-types`,
      `${this.uploadDir}/facilities`,
      `${this.uploadDir}/thumbnails`
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        logger.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  getMulterConfig(uploadType: 'hotels' | 'rooms' | 'room-types' | 'facilities') {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `${this.uploadDir}/${uploadType}`);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uploadType}-${uniqueSuffix}${ext}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Max 10 files per upload
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
        }
      }
    });
  }

  async processImage(
    filePath: string, 
    options: ImageProcessingOptions = {}
  ): Promise<{ processedPath: string; thumbnailPath?: string }> {
    const {
      width = 1200,
      height = 800,
      quality = 85,
      format = 'jpeg',
      createThumbnail = true,
      thumbnailSize = { width: 300, height: 200 }
    } = options;

    const ext = `.${format}`;
    const processedPath = filePath.replace(path.extname(filePath), `_processed${ext}`);
    
    try {
      // Process main image
      await sharp(filePath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .toFile(processedPath);

      let thumbnailPath: string | undefined;
      
      if (createThumbnail) {
        const thumbnailDir = path.join(path.dirname(filePath), '../thumbnails');
        await fs.mkdir(thumbnailDir, { recursive: true });
        
        thumbnailPath = path.join(
          thumbnailDir, 
          `thumb_${path.basename(processedPath)}`
        );
        
        await sharp(filePath)
          .resize(thumbnailSize.width, thumbnailSize.height, { 
            fit: 'cover' 
          })
          .jpeg({ quality: 70 })
          .toFile(thumbnailPath);
      }

      // Remove original file
      await fs.unlink(filePath);
      
      return { processedPath, thumbnailPath };
    } catch (error) {
      logger.error('Image processing failed:', error);
      throw new Error('Failed to process image');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      
      // Also try to delete thumbnail if exists
      const thumbnailPath = filePath.replace(
        path.dirname(filePath),
        path.join(path.dirname(filePath), '../thumbnails')
      ).replace(path.basename(filePath), `thumb_${path.basename(filePath)}`);
      
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        // Thumbnail might not exist, ignore error
      }
    } catch (error) {
      logger.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  getFileUrl(filePath: string): string {
    return `/uploads/${path.relative(this.uploadDir, filePath).replace(/\\/g, '/')}`;
  }

  formatUploadedFiles(files: Express.Multer.File[]): UploadedFile[] {
    return files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: this.getFileUrl(file.path)
    }));
  }
}