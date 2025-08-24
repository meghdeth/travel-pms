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
 * Generate hotel ID in format: 1XXXXXXX (1 + 7-digit number)
 */
export async function generateHotelId(): Promise<string> {
  // Get the latest hotel ID
  const latestHotel = await db('hotels')
    .select('hotel_id')
    .where('hotel_id', 'like', '1%')
    .orderBy('hotel_id', 'desc')
    .first();
  
  let nextNumber = 1000001; // Start from 1000001
  
  if (latestHotel && latestHotel.hotel_id) {
    const currentNumber = parseInt(latestHotel.hotel_id.substring(1));
    nextNumber = currentNumber + 1;
  }
  
  return `1${nextNumber.toString().padStart(7, '0')}`;
}

/**
 * Generate user ID in format: XHHHHHHHRNNNN
 * X = Entity type (1=hotel, 2=vendor)
 * HHHHHHH = Hotel ID (7 digits)
 * R = Role digit
 * NNNN = Sequential user number (4 digits)
 */
export async function generateUserId(
  hotelId: string, 
  role: string, 
  entityType: 'hotel' | 'vendor' = 'hotel'
): Promise<string> {
  const entityPrefix = ENTITY_PREFIXES[entityType.toUpperCase() as keyof typeof ENTITY_PREFIXES];
  const roleDigit = ROLE_DIGITS[role as keyof typeof ROLE_DIGITS];
  
  if (!roleDigit) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  // Extract hotel number (remove the leading 1 if it's a hotel ID)
  const hotelNumber = hotelId.startsWith('1') ? hotelId.substring(1) : hotelId;
  
  // Get the count of existing users with this hotel ID and role
  const userCount = await db('hotel_users')
    .where({ hotel_id: hotelId, role })
    .count('id as count');
  
  const nextUserNumber = (Array.isArray(userCount) ? userCount[0].count : userCount.count) + 1;
  
  // Format: EntityPrefix + HotelNumber + RoleDigit + UserNumber
  const userId = `${entityPrefix}${hotelNumber}${roleDigit}${nextUserNumber.toString().padStart(4, '0')}`;
  
  return userId;
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