import { Response } from 'express';
import { HotelUser } from '@/models/HotelUser';
import { Hotel } from '@/models/Hotel';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';
import { HotelAuthRequest } from '@/types/auth';
import { UniqueIdGenerator } from '@/utils/uniqueIdGenerator';
import bcrypt from 'bcryptjs';

const ROLE_CODE_TO_NAME: { [key: string]: string } = {
  '1': 'Hotel Admin',
  '2': 'Manager',
  '3': 'Finance Department',
  '4': 'Front Desk',
  '5': 'Booking Agent',
  '6': 'Gatekeeper',
  '7': 'Support',
  '8': 'Tech Support',
  '9': 'Service Boy',
  '10': 'Maintenance',
  '11': 'Kitchen'
};

const ROLE_NAME_TO_CODE: { [key: string]: string } = {
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

export class HotelUserController {
  // Get all users for a specific hotel with count and details
  // In getHotelUsers method, around line 45
  getHotelUsers = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.hotelUser;
  
      // Verify hotel access - only Hotel Admin can access this endpoint
      if (currentUser?.hotel_id !== hotelId) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }
  
      // Fix: Check role properly - role should be '1' for Hotel Admin
      if (currentUser?.role !== '1') {
        return ApiResponse.error(res, 'Only Hotel Admin can access hotel users', 403);
      }

      // Get all users for the hotel
      const users = await HotelUser.query()
        .where('hotel_id', hotelId)
        .select(
          'hotel_user_id',
          'email', 
          'first_name',
          'last_name',
          'phone',
          'role',
          'status',
          'last_login',
          'created_by',
          'created_at'
        )
        .withGraphFetched('createdBy(selectBasic)')
        .modifiers({
          selectBasic(builder) {
            builder.select('hotel_user_id', 'first_name', 'last_name', 'email');
          }
        })
        .orderBy('created_at', 'desc');

      // Get user count by status
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;
      const inactiveUsers = users.filter(user => user.status === 'inactive').length;

      // Get role distribution
      const roleDistribution = users.reduce((acc, user) => {
        const roleName = this.getRoleName(user.role);
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const response = {
        hotel_id: hotelId,
        total_users: totalUsers,
        active_users: activeUsers,
        inactive_users: inactiveUsers,
        role_distribution: roleDistribution,
        users: users
      };

      ApiResponse.success(res, response, 'Hotel users retrieved successfully');
    } catch (error) {
      logger.error('Get hotel users error:', error);
      ApiResponse.error(res, 'Failed to retrieve hotel users', 500);
    }
  };

  // Helper method to get role name from role code
  private getRoleName(role: string): string {
    const roleMap: { [key: string]: string } = {
      '1': 'Hotel Admin',
      '2': 'Manager',
      '3': 'Finance Department',
      '4': 'Front Desk',
      '5': 'Booking Agent',
      '6': 'Gatekeeper',
      '7': 'Support',
      '8': 'Tech Support',
      '9': 'Service Boy',
      '10': 'Maintenance',
      '11': 'Kitchen'
    };
    return roleMap[role] || role;
  }
  // Get all staff members for a hotel
  getStaffMembers = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const currentUser = req.hotelUser;

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      // Only Hotel Admin can view all staff
      if (currentUser?.role !== '1') {
        return ApiResponse.error(res, 'Only Hotel Admin can view staff members', 403);
      }

      const staffMembers = await HotelUser.query()
        .where('hotel_id', hotel_id)
        .select('hotel_user_id', 'email', 'first_name', 'last_name', 'phone', 'role', 'status', 'last_login', 'created_by', 'created_at')
        .orderBy('created_at', 'desc');

      ApiResponse.success(res, staffMembers, 'Staff members retrieved successfully');
    } catch (error) {
      logger.error('Get staff members error:', error);
      ApiResponse.error(res, 'Failed to retrieve staff members', 500);
    }
  };

  // Get single staff member
  getStaffMember = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id, id } = req.params;
      const currentUser = req.hotelUser;

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      const staffMember = await HotelUser.query()
        .findOne('hotel_user_id', id)
        .select('hotel_user_id', 'hotel_id', 'email', 'first_name', 'last_name', 'phone', 'role', 'permissions', 'status', 'last_login', 'created_by', 'created_at');

      if (!staffMember) {
        return ApiResponse.error(res, 'Staff member not found', 404);
      }

      // Verify hotel access again
      if (staffMember.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this staff member', 403);
      }

      // Only Hotel Admin can view other staff details, or user can view their own
      if (currentUser?.role !== '1' && currentUser?.hotel_user_id !== id) {
        return ApiResponse.error(res, 'Access denied', 403);
      }

      ApiResponse.success(res, staffMember, 'Staff member retrieved successfully');
    } catch (error) {
      logger.error('Get staff member error:', error);
      ApiResponse.error(res, 'Failed to retrieve staff member', 500);
    }
  };

  // Create new staff member
  createStaffMember = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const currentUser = req.hotelUser;
      const { email, password, first_name, last_name, phone, role } = req.body;

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      // Only Hotel Admin can create staff
      if (currentUser?.role !== '1') {
        return ApiResponse.error(res, 'Only Hotel Admin can create staff members', 403);
      }

      // Validate required fields
      if (!email || !password || !first_name || !last_name || !role) {
        return ApiResponse.error(res, 'Missing required fields', 400);
      }

      // Validate role
      const validRoles = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
      if (!validRoles.includes(role)) {
        return ApiResponse.error(res, 'Invalid role specified', 400);
      }

      // Check if email already exists
      const existingUser = await HotelUser.query().findOne('email', email);
      if (existingUser) {
        return ApiResponse.error(res, 'Email already exists', 409);
      }

      // Verify hotel exists
      const hotel = await Hotel.query().findOne('hotel_id', hotel_id);
      if (!hotel) {
        return ApiResponse.error(res, 'Hotel not found', 404);
      }

      // Generate unique hotel user ID
      const hotel_user_id = UniqueIdGenerator.generateHotelUserId(role, hotel_id);

      // Get role permissions
      const permissions = JSON.stringify(UniqueIdGenerator.getHotelRolePermissions(role));

      // Create staff member with proper typing (password will be hashed in model's $beforeInsert)
      const staffMemberData = {
        hotel_user_id,
        hotel_id,
        email,
        password,
        first_name,
        last_name,
        phone,
        role: role as HotelUser['role'],
        permissions,
        status: 'active' as const,
        created_by: currentUser?.hotel_user_id
      };

      const staffMember = await HotelUser.query().insert(staffMemberData);

      // Return staff member without password
      const { password: _, ...staffMemberResponse } = staffMember;

      ApiResponse.success(res, staffMemberResponse, 'Staff member created successfully', 201);
    } catch (error) {
      logger.error('Create staff member error:', error);
      ApiResponse.error(res, 'Failed to create staff member', 500);
    }
  };

  // Update staff member
  updateStaffMember = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id, id } = req.params;
      const currentUser = req.hotelUser;
      const { email, first_name, last_name, phone, role, status } = req.body;

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      const staffMember = await HotelUser.query().findOne('hotel_user_id', id);
      if (!staffMember) {
        return ApiResponse.error(res, 'Staff member not found', 404);
      }

      // Verify hotel access again
      if (staffMember.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this staff member', 403);
      }

      // Only Hotel Admin can update other staff, or user can update their own basic info
      const isOwnProfile = currentUser?.hotel_user_id === id;
      const isAdmin = currentUser?.role === '1';

      if (!isAdmin && !isOwnProfile) {
        return ApiResponse.error(res, 'Access denied', 403);
      }

      // Prepare update data
      const updateData: Partial<HotelUser> = {};

      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (phone !== undefined) updateData.phone = phone;

      // Only admin can update email, role, and status
      if (isAdmin) {
        if (email && email !== staffMember.email) {
          // Check if new email already exists
          const existingUser = await HotelUser.query()
            .findOne('email', email)
            .whereNot('hotel_user_id', id);
          if (existingUser) {
            return ApiResponse.error(res, 'Email already exists', 409);
          }
          updateData.email = email;
        }

        if (role && role !== staffMember.role) {
          const validRoles = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
          if (!validRoles.includes(role)) {
            return ApiResponse.error(res, 'Invalid role specified', 400);
          }
          updateData.role = role as HotelUser['role'];
          updateData.permissions = JSON.stringify(UniqueIdGenerator.getHotelRolePermissions(role));
        }

        if (status && ['active', 'inactive'].includes(status)) {
          updateData.status = status as 'active' | 'inactive';
        }
      } else {
        // Non-admin users cannot update email, role, or status
        if (email || role || status) {
          return ApiResponse.error(res, 'You can only update your basic profile information', 403);
        }
      }

      if (Object.keys(updateData).length === 0) {
        return ApiResponse.error(res, 'No valid fields to update', 400);
      }

      const updatedStaffMember = await HotelUser.query()
        .patchAndFetchById(staffMember.id, updateData)
        .select('hotel_user_id', 'hotel_id', 'email', 'first_name', 'last_name', 'phone', 'role', 'status', 'last_login', 'created_at');

      ApiResponse.success(res, updatedStaffMember, 'Staff member updated successfully');
    } catch (error) {
      logger.error('Update staff member error:', error);
      ApiResponse.error(res, 'Failed to update staff member', 500);
    }
  };

  // Update staff member password
  updateStaffPassword = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id, id } = req.params;
      const currentUser = req.hotelUser;
      const { current_password, new_password } = req.body;

      if (!new_password) {
        return ApiResponse.error(res, 'New password is required', 400);
      }

      if (new_password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
      }

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      const staffMember = await HotelUser.query().findOne('hotel_user_id', id);
      if (!staffMember) {
        return ApiResponse.error(res, 'Staff member not found', 404);
      }

      // Verify hotel access again
      if (staffMember.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this staff member', 403);
      }

      const isOwnProfile = currentUser?.hotel_user_id === id;
      const isAdmin = currentUser?.role === '1';

      if (!isAdmin && !isOwnProfile) {
        return ApiResponse.error(res, 'Access denied', 403);
      }

      // If updating own password, verify current password
      if (isOwnProfile && !isAdmin) {
        if (!current_password) {
          return ApiResponse.error(res, 'Current password is required', 400);
        }

        const isCurrentPasswordValid = await staffMember.verifyPassword(current_password);
        if (!isCurrentPasswordValid) {
          return ApiResponse.error(res, 'Current password is incorrect', 400);
        }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 12);

      await HotelUser.query()
        .findById(staffMember.id)
        .patch({ password: hashedPassword });

      ApiResponse.success(res, null, 'Password updated successfully');
    } catch (error) {
      logger.error('Update staff password error:', error);
      ApiResponse.error(res, 'Failed to update password', 500);
    }
  };

  // Delete staff member
  deleteStaffMember = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id, id } = req.params;
      const currentUser = req.hotelUser;

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      const staffMember = await HotelUser.query().findOne('hotel_user_id', id);
      if (!staffMember) {
        return ApiResponse.error(res, 'Staff member not found', 404);
      }

      // Verify hotel access again
      if (staffMember.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this staff member', 403);
      }

      // Only Hotel Admin can delete staff
      if (currentUser?.role !== '1') {
        return ApiResponse.error(res, 'Only Hotel Admin can delete staff members', 403);
      }

      // Prevent admin from deleting themselves
      if (currentUser?.hotel_user_id === id) {
        return ApiResponse.error(res, 'You cannot delete your own account', 400);
      }

      await HotelUser.query().deleteById(staffMember.id);

      ApiResponse.success(res, null, 'Staff member deleted successfully');
    } catch (error) {
      logger.error('Delete staff member error:', error);
      ApiResponse.error(res, 'Failed to delete staff member', 500);
    }
  };

  // Get current user profile
  getCurrentProfile = async (req: HotelAuthRequest, res: Response) => {
    try {
      const currentUser = req.hotelUser;

      if (!currentUser) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      const profile = await HotelUser.query()
        .findOne('hotel_user_id', currentUser.hotel_user_id)
        .select('hotel_user_id', 'hotel_id', 'email', 'first_name', 'last_name', 'phone', 'role', 'permissions', 'status', 'last_login', 'created_by', 'created_at')
        .withGraphFetched('hotel');

      if (!profile) {
        return ApiResponse.error(res, 'Profile not found', 404);
      }

      ApiResponse.success(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get current profile error:', error);
      ApiResponse.error(res, 'Failed to retrieve profile', 500);
    }
  };

  // Get staff statistics for dashboard
  getStaffStatistics = async (req: HotelAuthRequest, res: Response) => {
    try {
      const { hotel_id } = req.params;
      const currentUser = req.hotelUser;

      // Verify hotel access
      if (currentUser?.hotel_id !== hotel_id) {
        return ApiResponse.error(res, 'Access denied to this hotel', 403);
      }

      // Only Hotel Admin can view statistics
      if (currentUser?.role !== '1') {
        return ApiResponse.error(res, 'Only Hotel Admin can view staff statistics', 403);
      }

      const totalStaff = await HotelUser.query()
        .where('hotel_id', hotel_id)
        .count('* as count')
        .first() as { count: string } | undefined;

      const activeStaff = await HotelUser.query()
        .where('hotel_id', hotel_id)
        .where('status', 'active')
        .count('* as count')
        .first() as { count: string } | undefined;

      const suspendedStaff = await HotelUser.query()
        .where('hotel_id', hotel_id)
        .where('status', 'suspended')
        .count('* as count')
        .first() as { count: string } | undefined;

      const roleDistribution = await HotelUser.query()
        .where('hotel_id', hotel_id)
        .select('role')
        .count('* as count')
        .groupBy('role') as any[];

      const recentJoins = await HotelUser.query()
        .where('hotel_id', hotel_id)
        .select('hotel_user_id', 'first_name', 'last_name', 'role', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(5);

      const statistics = {
        totalStaff: parseInt(totalStaff?.count as string) || 0,
        activeStaff: parseInt(activeStaff?.count as string) || 0,
        inactiveStaff: (parseInt(totalStaff?.count as string) || 0) - (parseInt(activeStaff?.count as string) || 0) - (parseInt(suspendedStaff?.count as string) || 0),
        suspendedStaff: parseInt(suspendedStaff?.count as string) || 0,
        roleDistribution: roleDistribution,
        recentJoins: recentJoins
      };

      ApiResponse.success(res, statistics, 'Staff statistics retrieved successfully');
    } catch (error) {
      logger.error('Get staff statistics error:', error);
      ApiResponse.error(res, 'Failed to retrieve staff statistics', 500);
    }
  };
}