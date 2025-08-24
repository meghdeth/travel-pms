import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Super Admin Login
  superAdminLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.superAdminLogin(email, password);
      
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('Super admin login error:', error);
      ApiResponse.error(res, 'Login failed', 401);
    }
  };

  // Vendor Login
  vendorLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.vendorLogin(email, password);
      
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('Vendor login error:', error);
      ApiResponse.error(res, 'Login failed', 401);
    }
  };

  // Vendor Registration
  vendorRegister = async (req: Request, res: Response) => {
    try {
      const vendorData = req.body;
      const result = await this.authService.vendorRegister(vendorData);
      
      ApiResponse.success(res, result, 'Vendor registration successful', 201);
    } catch (error) {
      logger.error('Vendor registration error:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'Registration failed', 400);
    }
  };

  // Hotel User Login (Unified for all hotel staff)
  hotelAdminLogin = async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      
      // Add input validation
      if (!identifier || !password) {
        return ApiResponse.error(res, 'Identifier and password are required', 400);
      }
      
      if (typeof identifier !== 'string' || typeof password !== 'string') {
        return ApiResponse.error(res, 'Invalid input format', 400);
      }
      
      const result = await this.authService.hotelAdminLogin(identifier, password);
      
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('Hotel user login error:', error);
      ApiResponse.error(res, 'Login failed', 401);
    }
  };

  // User Registration
  userRegister = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const result = await this.authService.userRegister(userData);
      
      ApiResponse.success(res, result, 'Registration successful', 201);
    } catch (error) {
      logger.error('User registration error:', error);
      ApiResponse.error(res, 'Registration failed', 400);
    }
  };

  // User Login
  userLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.userLogin(email, password);
      
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('User login error:', error);
      ApiResponse.error(res, 'Login failed', 401);
    }
  };

  // Hotel Registration
  hotelRegister = async (req: Request, res: Response) => {
    try {
      const hotelData = req.body;
      const result = await this.authService.hotelRegister(hotelData);
      
      ApiResponse.success(res, result, 'Hotel registration successful', 201);
    } catch (error) {
      logger.error('Hotel registration error:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'Registration failed', 400);
    }
  };

  // Refresh Token
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      
      ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh error:', error);
      ApiResponse.error(res, 'Token refresh failed', 401);
    }
  };

  // Logout
  logout = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await this.authService.logout(token);
      }
      
      ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      ApiResponse.error(res, 'Logout failed', 400);
    }
  };
}