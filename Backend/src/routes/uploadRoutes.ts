import { Router } from 'express';
import { authenticateToken, requireRole } from '@/middleware/auth';
import { UploadController } from '@/controllers/UploadController';
import { hotelUpload, roomTypeUpload, facilityUpload } from '@/middleware/uploadMiddleware';

const router = Router();
const uploadController = new UploadController();

// Hotel image uploads
router.post('/hotels/:hotel_id/images',
  authenticateToken,
  requireRole(['hotel_admin', 'vendor', 'super_admin']),
  hotelUpload.multiple('images', 10),
  uploadController.uploadHotelImages
);

// Room type image uploads
router.post('/room-types/:room_type_id/images',
  authenticateToken,
  requireRole(['hotel_admin', 'vendor', 'super_admin']),
  roomTypeUpload.multiple('images', 10),
  uploadController.uploadRoomTypeImages
);

// Facility image uploads
router.post('/facilities/:facility_id/images',
  authenticateToken,
  requireRole(['hotel_admin', 'vendor', 'super_admin']),
  facilityUpload.multiple('images', 5),
  uploadController.uploadFacilityImages
);

// Delete image
router.delete('/images',
  authenticateToken,
  requireRole(['hotel_admin', 'vendor', 'super_admin']),
  uploadController.deleteImage
);

export default router;