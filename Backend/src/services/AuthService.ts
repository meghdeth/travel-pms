import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';
import { SuperAdmin } from '../models/SuperAdmin';
import { Role } from '../models/Role';
import { Hotel } from '../models/Hotel';
import { HotelUser } from '../models/HotelUser';
import { UniqueIdGenerator } from '../utils/uniqueIdGenerator';
import { JWTPayload, HotelJWTPayload, AuthResponse, RegisterRequest } from '../types/auth';
import { logger } from '../utils/logger';
import { tokenBlacklistService } from './TokenBlacklistService';

export class AuthService {
  // Remove the class property definitions and access env vars in methods
  private get JWT_SECRET() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
  }

  private get JWT_REFRESH_SECRET() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return secret;
  }

  private get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '1h';
  }

  private get JWT_REFRESH_EXPIRES_IN() {
    return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  // Generate JWT tokens
  private generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  // Generate Hotel JWT tokens
  private generateHotelTokens(payload: Omit<HotelJWTPayload, 'iat' | 'exp'>) {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  // Super Admin Login
  async superAdminLogin(email: string, password: string): Promise<AuthResponse['data']> {
    const superAdmin = await SuperAdmin.query().findOne({ email, status: 'active' });
    
    if (!superAdmin || !(await superAdmin.verifyPassword(password))) {
      throw new Error('Invalid credentials');
    }

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: superAdmin.id,
      email: superAdmin.email,
      userType: 'super_admin',
      permissions: ['*'] // Super admin has all permissions
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: superAdmin.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour in seconds
    };
  }

  // Vendor Login
  async vendorLogin(email: string, password: string): Promise<AuthResponse['data']> {
    const vendor = await Vendor.query().findOne({ email, status: 'active' });
    
    if (!vendor || !(await vendor.verifyPassword(password))) {
      throw new Error('Invalid credentials');
    }

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: vendor.id,
      email: vendor.email,
      userType: 'vendor',
      permissions: ['vendor.*']
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: vendor.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }

  // Hotel User Login - Unified login for all hotel users
  async hotelAdminLogin(identifier: string, password: string): Promise<AuthResponse['data']> {
    logger.info(`Hotel user login attempt for identifier: ${identifier}`);
    
    // Find user in HotelUser table only (unified authentication)
    const hotelUser = await HotelUser.query()
      .findOne(function() {
        this.where('email', identifier)
            .orWhere('hotel_user_id', identifier);
      })
      .where('status', 'active')
      .withGraphFetched('hotel');
    
    if (!hotelUser) {
      logger.error('Login failed: Hotel user not found');
      throw new Error('Invalid credentials');
    }
    
    const userRole = this.mapRoleToCode(hotelUser.role);
    const isAdmin = hotelUser.role === 'Hotel Admin';
    logger.info(`Hotel user found: Role=${hotelUser.role}, Code=${userRole}, IsAdmin=${isAdmin}`);
    
    logger.info(`Password comparison: provided='${password}', stored='${hotelUser.password}'`);
    const passwordValid = await bcrypt.compare(password, hotelUser.password);
    logger.info(`Password validation result: ${passwordValid}`);
    
    if (!passwordValid) {
      logger.error('Login failed: Invalid password');
      throw new Error('Invalid credentials');
    }
    
    // Get permissions based on role
    const permissions = UniqueIdGenerator.getHotelRolePermissions(hotelUser.role);
    
    // Generate HotelJWTPayload for hotel users
    const payload: Omit<HotelJWTPayload, 'iat' | 'exp'> = {
      id: hotelUser.id,
      email: hotelUser.email,
      userType: 'hotel_user',
      hotel_user_id: hotelUser.hotel_user_id!,
      hotel_id: hotelUser.hotel_id!.toString(),
      role: userRole as HotelJWTPayload['role'],
      permissions,
      vendor_id: hotelUser.hotel?.vendor_id || undefined
    };
    
    const { accessToken, refreshToken } = this.generateHotelTokens(payload);
    
    const userData = hotelUser.toJSON();
    delete userData.hotel; // Remove nested hotel to avoid duplication
    
    return {
      user: { 
        ...userData, 
        role: { 
          name: hotelUser.role, 
          code: userRole, 
          isAdmin 
        }
      },
      hotel: hotelUser.hotel?.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }
  
  // Helper method to map role names to numerical codes
  private mapRoleToCode(roleName: string): string {
    const roleMap: { [key: string]: string } = {
      'Hotel Admin': '1',
      'Manager': '2', 
      'Finance Department': '3',
      'Front Desk': '4',
      'Booking Agent': '5',
      'Gatekeeper': '6',
      'Support': '7',
      'Tech Support': '8',
      'Service Boy': '9',
      'Maintenance': '10',
      'Kitchen': '11'
    };
    return roleMap[roleName] || '1';
  }

  // User Registration
  async userRegister(userData: RegisterRequest): Promise<AuthResponse['data']> {
    // Check if user already exists
    const existingUser = await User.query().findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Check username uniqueness
    const existingUsername = await User.query().findOne({ username: userData.username });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Create new user
    const user = await User.query().insert({
      ...userData,
      status: 'active',
      email_verified: false
    });

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: user.id,
      email: user.email,
      userType: 'user',
      permissions: ['user.*']
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }

  // Vendor Registration
  async vendorRegister(vendorData: any): Promise<AuthResponse['data']> {
    // Check if vendor already exists
    const existingVendor = await Vendor.query().findOne({ email: vendorData.email });
    if (existingVendor) {
      throw new Error('Vendor already exists with this email');
    }

    // Check username uniqueness
    const existingUsername = await Vendor.query().findOne({ username: vendorData.username });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Prepare vendor data, only include defined values
    const insertData: any = {
      username: vendorData.username,
      email: vendorData.email,
      password: vendorData.password,
      company_name: vendorData.company_name,
      contact_person: vendorData.contact_person,
      status: 'active',
      hotel_limit: 5,
      commission_percentage: 10.0,
      subscription_plan: 'basic',
      total_earnings: 0.0,
      available_balance: 0.0
    };

    // Only add optional fields if they have values
    if (vendorData.phone) insertData.phone = vendorData.phone;
    if (vendorData.address) insertData.address = vendorData.address;
    if (vendorData.city) insertData.city = vendorData.city;
    if (vendorData.state) insertData.state = vendorData.state;
    if (vendorData.country) insertData.country = vendorData.country;
    if (vendorData.postal_code) insertData.postal_code = vendorData.postal_code;

    // Create new vendor
    const vendor = await Vendor.query().insert(insertData);

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: vendor.id,
      email: vendor.email,
      userType: 'vendor',
      permissions: ['vendor.*']
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: vendor.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }

  // User Login
  async userLogin(email: string, password: string): Promise<AuthResponse['data']> {
    const user = await User.query().findOne({ email, status: 'active' });
    
    if (!user || !(await user.verifyPassword(password))) {
      throw new Error('Invalid credentials');
    }

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: user.id,
      email: user.email,
      userType: 'user',
      permissions: ['user.*']
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<AuthResponse['data']> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as JWTPayload;
      
      // Generate new tokens
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        id: decoded.id,
        email: decoded.email,
        userType: decoded.userType,
        permissions: decoded.permissions
      };

      const tokens = this.generateTokens(payload);

      // Get fresh user data
      let user;
      switch (decoded.userType) {
        case 'super_admin':
          user = await SuperAdmin.query().findById(decoded.id);
          break;
        case 'vendor':
          user = await Vendor.query().findById(decoded.id);
          break;
        case 'admin':
          user = await HotelUser.query().findById(decoded.id);
          break;
        case 'user':
          user = await User.query().findById(decoded.id);
          break;
        default:
          throw new Error('Invalid user type');
      }

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: user.toJSON(),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  // Logout with token blacklisting
  async logout(token: string): Promise<void> {
    try {
      // Decode the token to get expiry time
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        // Add token to blacklist with its expiry time
        tokenBlacklistService.blacklistToken(token, decoded.exp);
        logger.info('User logged out and token blacklisted', { 
          tokenPreview: token.substring(0, 20) + '...',
          userType: decoded.userType,
          email: decoded.email
        });
      } else {
        logger.warn('Invalid token format during logout', { 
          tokenPreview: token.substring(0, 20) + '...' 
        });
      }
    } catch (error) {
      logger.error('Error during logout:', error);
      // Still try to blacklist the token even if decoding fails
      tokenBlacklistService.blacklistToken(token, Date.now() / 1000 + 3600); // 1 hour from now
    }
  }

  // Verify Email (for email verification flow)
  async verifyEmail(token: string): Promise<boolean> {
    const user = await User.query().findOne({ verification_token: token });
    
    if (!user) {
      throw new Error('Invalid verification token');
    }

    await User.query().patchAndFetchById(user.id, {
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      verification_token: null
    });

    return true;
  }

  // Password Reset Request
  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await User.query().findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not
      return true;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would send this token via email
    logger.info('Password reset requested', { email, resetToken });
    
    return true;
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { id: number; email: string };
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await User.query().patchAndFetchById(decoded.id, {
        password: hashedPassword
      });

      return true;
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  // Hotel Registration
  // Hotel registration creates both hotel AND admin account
  async hotelRegister(hotelData: any): Promise<AuthResponse['data']> {
    // Check if hotel admin email already exists in hotel_users
    const existingHotelAdmin = await HotelUser.query().findOne({ email: hotelData.email });
    if (existingHotelAdmin) {
      throw new Error('Hotel admin already exists with this email');
    }

    // Check if hotel email already exists
    const existingHotel = await Hotel.query().findOne({ email: hotelData.email });
    if (existingHotel) {
      throw new Error('Hotel already exists with this email');
    }

    // Validate vendor if vendor_id is provided
    if (hotelData.vendor_id) {
      const vendor = await Vendor.query().findById(hotelData.vendor_id);
      if (!vendor) {
        throw new Error('Invalid vendor ID');
      }
    }

    // Create hotel slug from name
    const slug = hotelData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Prepare hotel data
    const hotelInsertData = {
      vendor_id: hotelData.vendor_id || null,
      name: hotelData.name,
      slug: slug,
      description: hotelData.description || null,
      address: hotelData.address,
      city: hotelData.city,
      state: hotelData.state,
      country: hotelData.country || 'India', // Add default country value
      postal_code: hotelData.postal_code || null,
      phone: hotelData.phone || null,
      email: hotelData.email,
      star_rating: hotelData.star_rating || 1,
      check_in_time: hotelData.check_in_time || '14:00:00',
      check_out_time: hotelData.check_out_time || '11:00:00',
      status: 'pending' as const
    };

    // Create hotel
    const hotel = await Hotel.query().insert(hotelInsertData);
    
    // Generate unique hotel user ID for admin
    const hotel_user_id = UniqueIdGenerator.generateHotelUserId('Hotel Admin', hotel.hotel_id!);
    
    // Get permissions based on role
    const permissions = UniqueIdGenerator.getHotelRolePermissions('Hotel Admin');
    
    // Create hotel admin in HotelUser table only (unified approach)
    const hotelUserInsertData = {
        hotel_user_id: hotel_user_id,
        hotel_id: hotel.hotel_id!, // Use hotel_id instead of id
        email: hotelData.email,
        password: hotelData.password, // Will be hashed by model's beforeInsert
        first_name: hotelData.first_name || 'Hotel',
        last_name: hotelData.last_name || 'Admin',
        phone: hotelData.phone || null,
        role: 'Hotel Admin' as const,
        permissions: JSON.stringify(permissions),
        status: 'active' as const
        // created_by is omitted for system-generated admin (undefined for audit tracking)
    };
    
    const hotelAdmin = await HotelUser.query().insert(hotelUserInsertData);

    // Get role code for JWT
    const roleCode = this.mapRoleToCode('Hotel Admin');

    // Generate HotelJWTPayload for hotel admin
    const payload: Omit<HotelJWTPayload, 'iat' | 'exp'> = {
      id: hotelAdmin.id,
      email: hotelAdmin.email,
      userType: 'hotel_user',
      hotel_user_id: hotel_user_id,
      hotel_id: hotel.hotel_id!.toString(),
      role: roleCode as HotelJWTPayload['role'],
      permissions,
      vendor_id: hotel.vendor_id || undefined
    };

    const { accessToken, refreshToken } = this.generateHotelTokens(payload);

    const adminData = hotelAdmin.toJSON();
    
    return {
      user: { 
        ...adminData, 
        role: { name: 'Hotel Admin', code: roleCode, isAdmin: true }
      },
      hotel: hotel.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }
}