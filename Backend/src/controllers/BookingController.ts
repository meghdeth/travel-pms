import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { AuthRequest } from '../types/auth';
import { CreateBookingRequest, UpdateBookingRequest } from '../types/booking';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  // Create a new booking
  async createBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bookingData: CreateBookingRequest = req.body;
      const booking = await this.bookingService.createBooking(bookingData, req.user);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create booking'
      });
    }
  }

  // Get all bookings with filters
  async getBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, hotel_id, user_id, date_from, date_to } = req.query;
      
      const filters = {
        status: status as string,
        hotel_id: hotel_id ? parseInt(hotel_id as string) : undefined,
        user_id: user_id ? parseInt(user_id as string) : undefined,
        date_from: date_from as string,
        date_to: date_to as string
      };
      
      const result = await this.bookingService.getBookings(
        parseInt(page as string),
        parseInt(limit as string),
        filters,
        req.user
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bookings'
      });
    }
  }

  // Get booking by ID
  async getBookingById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.getBookingById(parseInt(id), req.user);
      
      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: booking
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch booking'
      });
    }
  }

  // Update booking
  async updateBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateBookingRequest = req.body;
      
      const booking = await this.bookingService.updateBooking(
        parseInt(id),
        updateData,
        req.user
      );
      
      res.json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update booking'
      });
    }
  }

  // Cancel booking
  async cancelBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const booking = await this.bookingService.cancelBooking(
        parseInt(id),
        reason,
        req.user
      );
      
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel booking'
      });
    }
  }

  // Check-in booking
  async checkInBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const booking = await this.bookingService.checkInBooking(parseInt(id), req.user);
      
      res.json({
        success: true,
        message: 'Guest checked in successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to check in guest'
      });
    }
  }

  // Check-out booking
  async checkOutBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const booking = await this.bookingService.checkOutBooking(parseInt(id), req.user);
      
      res.json({
        success: true,
        message: 'Guest checked out successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to check out guest'
      });
    }
  }

  // Get booking statistics
  async getBookingStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { hotel_id, date_from, date_to } = req.query;
      
      const stats = await this.bookingService.getBookingStats(
        hotel_id ? parseInt(hotel_id as string) : undefined,
        date_from as string,
        date_to as string,
        req.user
      );
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch booking statistics'
      });
    }
  }
}