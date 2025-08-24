import db from '../config/database';

// Role digit mapping
export const ROLE_DIGITS = {
  'GOD Admin': 1,
  'Super Admin': 2,
  'Hotel Admin': 3,
  'Manager': 4,
  'Finance Department': 5,
  'Front Desk': 6,
  'Booking Agent': 7,
  'Gatekeeper': 8,
  'Support': 9,
  'Tech Support': 10,
  'Service Boy': 11,
  'Maintenance': 12,
  'Kitchen': 13
};

export const ENTITY_PREFIXES = {
  HOTEL: '1',
  VENDOR: '2'
};

/**
 * Generate hotel ID in format: 1000000001, 1000000002, 1000000003, etc.
 * Always starts from 1000000001 and increments by 1
 */
export async function generateHotelId(): Promise<string> {
  let nextId = 1000000001; // Start from 1000000001
  
  // Keep checking if the ID exists and increment until we find an available one
  while (true) {
    const existingHotel = await db('hotels')
      .select('hotel_id')
      .where('hotel_id', nextId.toString())
      .first();
    
    if (!existingHotel) {
      // ID is available, return it
      return nextId.toString();
    }
    
    // ID exists, increment and try next one
    nextId++;
  }
}

/**
 * Generate user ID in format: [10-digit Hotel ID][1-digit User Type][4-digit User Number]
 * Example: 100000000110001 = Hotel 1000000001 + GOD Admin (1) + User 0001
 */
export async function generateUserId(
  hotelId: string, 
  role: string
): Promise<string> {
  // User type mapping based on roles
  const userTypeMap: { [key: string]: string } = {
    'GOD Admin': '1',
    'Super Admin': '2',
    'Hotel Admin': '3',
    'Manager': '4',
    'Finance Department': '5',
    'Front Desk': '6',
    'Booking Agent': '7',
    'Gatekeeper': '8',
    'Support': '9',
    'Tech Support': '0', // Using 0 for Tech Support (10th type)
    'Service Boy': '1',  // Can reuse digits for different categories
    'Maintenance': '2',
    'Kitchen': '3'
  };
  
  const userType = userTypeMap[role];
  if (!userType) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  // Ensure hotel ID is 10 digits
  const hotelIdFormatted = hotelId.toString().padStart(10, '0');
  
  // Get the next user number for this hotel (across all roles)
  let nextUserNumber = 1;
  
  // Keep checking if the user ID exists and increment until we find an available one
  while (true) {
    const userId = `${hotelIdFormatted}${userType}${nextUserNumber.toString().padStart(4, '0')}`;
    
    const existingUser = await db('hotel_users')
      .where('hotel_user_id', userId)
      .first();
    
    if (!existingUser) {
      // ID is available, return it
      return userId;
    }
    
    // ID exists, increment and try next one
    nextUserNumber++;
  }
}

/**
 * Parse user ID to extract information
 */
export function parseUserId(userId: string): {
  entityType: 'hotel' | 'vendor';
  hotelNumber: string;
  roleDigit: number;
  userNumber: number;
} {
  if (userId.length !== 14) {
    throw new Error('Invalid user ID format');
  }
  
  const entityType = userId[0] === '1' ? 'hotel' : 'vendor';
  const hotelNumber = userId.substring(1, 8);
  const roleDigit = parseInt(userId[8]);
  const userNumber = parseInt(userId.substring(9, 13));
  
  return {
    entityType,
    hotelNumber,
    roleDigit,
    userNumber
  };
}

/**
 * Get role name from role digit
 */
export function getRoleFromDigit(digit: number): string {
  const roleEntry = Object.entries(ROLE_DIGITS).find(([role, roleDigit]) => roleDigit === digit);
  return roleEntry ? roleEntry[0] : 'Unknown';
}

/**
 * Validate hotel admin creation permissions
 * Only GOD Admin and Super Admin can create other admins
 */
export function canCreateRole(creatorRole: string, targetRole: string): boolean {
  const creatorRoleLevel = ROLE_DIGITS[creatorRole as keyof typeof ROLE_DIGITS];
  const targetRoleLevel = ROLE_DIGITS[targetRole as keyof typeof ROLE_DIGITS];
  
  // GOD Admin can create anyone
  if (creatorRole === 'GOD Admin') {
    return true;
  }
  
  // Super Admin can create anyone except GOD Admin
  if (creatorRole === 'Super Admin' && targetRole !== 'GOD Admin') {
    return true;
  }
  
  // Hotel Admin cannot create other admins (only GOD and Super can)
  if (creatorRole === 'Hotel Admin' && targetRoleLevel <= 3) {
    return false;
  }
  
  // Manager and below can only create staff roles
  if (creatorRoleLevel >= 4 && targetRoleLevel <= 4) {
    return false;
  }
  
  return true;
}

export default {
  generateHotelId,
  generateUserId,
  parseUserId,
  getRoleFromDigit,
  canCreateRole,
  ROLE_DIGITS,
  ENTITY_PREFIXES
};