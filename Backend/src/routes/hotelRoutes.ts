import { Router } from 'express';
import { authenticateToken, requireRole } from '@/middleware/auth';
import { authenticateHotelToken, HotelAuthRequest } from '@/middleware/hotelAuth';
import { HotelController } from '@/controllers/HotelController';
import { RoomController } from '@/controllers/RoomController';
import { RoomTypeController } from '@/controllers/RoomTypeController';
import { BedController } from '@/controllers/BedController';
import { HotelService } from '@/services/HotelService';
import { BookingService } from '@/services/BookingService';
import { RoomService } from '@/services/RoomService';
import { Request, Response } from 'express';
import { ApiResponse } from '@/utils/ApiResponse';
import { AuthController } from '@/controllers/AuthController';
import { HotelUserController } from '@/controllers/HotelUserController';

const router = Router();
const authController = new AuthController();
const hotelUserController = new HotelUserController();

// Initialize controllers
const hotelController = new HotelController();
const roomController = new RoomController();
const roomTypeController = new RoomTypeController();
const bedController = new BedController();

// Initialize services
const hotelService = new HotelService();
const bookingService = new BookingService();
const roomService = new RoomService();

// Hotel Authentication Routes
// ===========================

// Public authentication routes
router.post('/login', authController.hotelAdminLogin);
router.post('/register', authController.hotelRegister);
router.post('/refresh-token', authController.refreshToken);

// Protected authentication routes
router.post('/logout', authenticateHotelToken, authController.logout);

// Hotel User Management Routes
// ============================

// Get current user profile
router.get('/user/profile', authenticateHotelToken, hotelUserController.getCurrentProfile);

// Get staff statistics - MUST be before parameterized routes to avoid conflicts
router.get('/:hotel_id/users/statistics', authenticateHotelToken, hotelUserController.getStaffStatistics);

// New endpoint: Get all users for a specific hotel (for hotel admin)
router.get('/:hotelId/users', authenticateHotelToken, hotelUserController.getHotelUsers);

// Get specific hotel user
router.get('/:hotel_id/users/:id', authenticateHotelToken, hotelUserController.getStaffMember);

// Create new hotel user
router.post('/:hotel_id/users', authenticateHotelToken, hotelUserController.createStaffMember);

// Update hotel user
router.put('/:hotel_id/users/:id', authenticateHotelToken, hotelUserController.updateStaffMember);

// Delete hotel user
router.delete('/:hotel_id/users/:id', authenticateHotelToken, hotelUserController.deleteStaffMember);

// Update staff password
router.put('/:hotel_id/users/:id/password', authenticateHotelToken, hotelUserController.updateStaffPassword);

// Hotel Management Routes
// ======================

// Get hotels for a vendor
router.get('/vendor/:vendor_id', 
  authenticateToken, 
  requireRole(['vendor', 'super_admin']), 
  hotelController.getHotels
);

// Get single hotel with details
router.get('/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  hotelController.getHotel
);

// Create new hotel
router.post('/', 
  authenticateToken, 
  requireRole(['vendor', 'super_admin']), 
  hotelController.createHotel
);

// Update hotel
router.put('/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  hotelController.updateHotel
);

// Delete hotel
router.delete('/:id', 
  authenticateToken, 
  requireRole(['vendor', 'super_admin']), 
  hotelController.deleteHotel
);

// Room Type Management Routes
// ===========================

// Get room types for a hotel
router.get('/:hotel_id/room-types', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomTypeController.getRoomTypes
);

// Get single room type
router.get('/room-types/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomTypeController.getRoomType
);

// Create room type
router.post('/:hotel_id/room-types', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomTypeController.createRoomType
);

// Update room type
router.put('/room-types/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomTypeController.updateRoomType
);

// Delete room type
router.delete('/room-types/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomTypeController.deleteRoomType
);

// Room Management Routes
// ======================

// Get rooms for a hotel
router.get('/:hotel_id/rooms', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomController.getRooms
);

// Get rooms by room type
router.get('/room-types/:room_type_id/rooms', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomController.getRoomsByType
);

// Get single room
router.get('/rooms/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomController.getRoom
);

// Create room
router.post('/:hotel_id/rooms', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomController.createRoom
);

// Update room
router.put('/rooms/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomController.updateRoom
);

// Delete room
router.delete('/rooms/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  roomController.deleteRoom
);

// Bed Management Routes
// =====================

// Get beds for a room
router.get('/rooms/:room_id/beds', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  bedController.getBeds
);

// Get single bed
router.get('/beds/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  bedController.getBed
);

// Create bed
router.post('/rooms/:room_id/beds', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  bedController.createBed
);

// Update bed
router.put('/beds/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  bedController.updateBed
);

// Delete bed
router.delete('/beds/:id', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  bedController.deleteBed
);

// Advanced Hotel Service Routes
// ==============================

// Check room availability
router.post('/:hotel_id/availability', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin', 'guest']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const { check_in, check_out, guests, room_type_id } = req.body;
      
      const availability = await hotelService.checkRoomAvailability({
        hotel_id: parseInt(hotel_id),
        check_in: new Date(check_in),
        check_out: new Date(check_out),
        guests,
        room_type_id
      });
      
      ApiResponse.success(res, availability, 'Room availability checked successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to check room availability', 500);
    }
  }
);

// Get hotel statistics
router.get('/:hotel_id/statistics', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const stats = await hotelService.getHotelStatistics(parseInt(hotel_id));
      
      ApiResponse.success(res, stats, 'Hotel statistics retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to retrieve hotel statistics', 500);
    }
  }
);

// Bulk Room Operations
// ====================

// Bulk create rooms
router.post('/:hotel_id/rooms/bulk', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const bulkData = { ...req.body, hotel_id: parseInt(hotel_id) };
      
      const result = await roomService.bulkCreateRooms(bulkData);
      
      ApiResponse.success(res, result, 'Rooms created successfully', 201);
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to create rooms', 500);
    }
  }
);

// Get room occupancy by floor
router.get('/:hotel_id/occupancy/floor', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const occupancy = await roomService.getRoomOccupancyByFloor(parseInt(hotel_id));
      
      ApiResponse.success(res, occupancy, 'Room occupancy by floor retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to retrieve room occupancy', 500);
    }
  }
);

// Dashboard Routes
// ================

// Get dashboard statistics for authenticated user's hotel
router.get('/dashboard/stats', 
  authenticateHotelToken, 
  async (req: HotelAuthRequest, res: Response) => {
    try {
      const hotelUser = req.hotelUser as any;
      
      if (!hotelUser || !hotelUser.hotel_id) {
        return ApiResponse.error(res, 'Hotel context not found', 400);
      }
      
      // Use the string hotel_id directly
      const hotel_id = hotelUser.hotel_id;
      
      const stats = await hotelService.getHotelStatistics(hotel_id);
      
      // Transform to match frontend expectations
      const dashboardStats = {
        totalRooms: stats.total_rooms,
        occupiedRooms: stats.occupied_rooms,
        todayRevenue: stats.monthly_revenue, // Using monthly revenue as placeholder
        totalBookings: stats.pending_bookings
      };
      
      ApiResponse.success(res, dashboardStats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to retrieve dashboard statistics', 500);
    }
  }
);

// Get recent bookings for authenticated user's hotel
router.get('/dashboard/recent-bookings', 
  authenticateHotelToken, 
  async (req: HotelAuthRequest, res: Response) => {
    try {
      const hotelUser = req.hotelUser as any;
      
      if (!hotelUser || !hotelUser.hotel_id) {
        return ApiResponse.error(res, 'Hotel context not found', 400);
      }
      
      // Use the string hotel_id directly
      const hotel_id = hotelUser.hotel_id;
      
      // Get recent bookings (limit to 10 most recent)
      const bookings = await bookingService.getBookings(
        1, // page
        10, // limit
        { hotel_id }, // filters
        hotelUser // user from auth middleware
      );
      
      // Transform to match frontend expectations
      const recentBookings = bookings.bookings.map((booking: any) => ({
        id: booking.id.toString(),
        guestName: `${booking.guest_details.first_name} ${booking.guest_details.last_name}`,
        roomNumber: booking.room?.room_number || 'N/A',
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        totalAmount: booking.pricing.total_amount,
        status: booking.status
      }));
      
      ApiResponse.success(res, recentBookings, 'Recent bookings retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to retrieve recent bookings', 500);
    }
  }
);

// Booking and Calendar Routes
// ===========================

// Get booking calendar
router.get('/:hotel_id/calendar', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const { start_date, end_date, room_type_id } = req.query;
      
      const calendar = await bookingService.getBookingCalendar({
        hotel_id: parseInt(hotel_id),
        start_date: new Date(start_date as string),
        end_date: new Date(end_date as string),
        room_type_id: room_type_id ? parseInt(room_type_id as string) : undefined
      });
      
      ApiResponse.success(res, calendar, 'Booking calendar retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to retrieve booking calendar', 500);
    }
  }
);

// Create booking
router.post('/:hotel_id/bookings', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin', 'guest']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const bookingData = { ...req.body, hotel_id: parseInt(hotel_id) };
      
      const booking = await bookingService.createBooking(bookingData);
      
      ApiResponse.success(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to create booking', 500);
    }
  }
);

// Get room availability report
router.get('/:hotel_id/reports/availability', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const { start_date, end_date } = req.query;
      
      const report = await bookingService.getRoomAvailabilityReport(
        parseInt(hotel_id),
        new Date(start_date as string),
        new Date(end_date as string)
      );
      
      ApiResponse.success(res, report, 'Availability report generated successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to generate availability report', 500);
    }
  }
);

// Get bookings for a hotel
router.get('/:hotel_id/bookings', 
  authenticateToken, 
  requireRole(['hotel_admin', 'vendor', 'super_admin']), 
  async (req: Request, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const { limit, sort, order } = req.query;
      
      // Use the existing getBookings method with proper parameters
      const bookings = await bookingService.getBookings(
        1, // page
        limit ? parseInt(limit as string) : 10, // limit
        { hotel_id: parseInt(hotel_id) }, // filters
        req.user // user from auth middleware
      );
      
      ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to retrieve bookings', 500);
    }
  }
);

export default router;