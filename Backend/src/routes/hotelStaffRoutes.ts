import { Router } from 'express';
import { HotelUserController } from '@/controllers/HotelUserController';
import { 
  authenticateHotelToken, 
  requireHotelRole, 
  requireHotelAdmin,
  verifyHotelOwnership 
} from '@/middleware/hotelAuth';

const router = Router();
const hotelUserController = new HotelUserController();

// Hotel Staff Management Routes
// =============================

// Get current user profile
router.get('/profile', 
  authenticateHotelToken,
  hotelUserController.getCurrentProfile
);

// Get all staff members for a hotel (Admin only)
router.get('/:hotel_id/staff', 
  authenticateHotelToken,
  verifyHotelOwnership,
  requireHotelAdmin,
  hotelUserController.getStaffMembers
);

// Get staff statistics for dashboard (Admin only)
router.get('/:hotel_id/staff/statistics', 
  authenticateHotelToken,
  verifyHotelOwnership,
  requireHotelAdmin,
  hotelUserController.getStaffStatistics
);

// Get single staff member
router.get('/staff/:hotel_user_id', 
  authenticateHotelToken,
  hotelUserController.getStaffMember
);

// Create new staff member (Admin only)
router.post('/:hotel_id/staff', 
  authenticateHotelToken,
  verifyHotelOwnership,
  requireHotelAdmin,
  hotelUserController.createStaffMember
);

// Update staff member
router.put('/staff/:hotel_user_id', 
  authenticateHotelToken,
  hotelUserController.updateStaffMember
);

// Update staff member password
router.patch('/staff/:hotel_user_id/password', 
  authenticateHotelToken,
  hotelUserController.updateStaffPassword
);

// Delete staff member (Admin only)
router.delete('/staff/:hotel_user_id', 
  authenticateHotelToken,
  requireHotelAdmin,
  hotelUserController.deleteStaffMember
);

export default router;