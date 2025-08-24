export interface UniqueIdConfig {
  prefix: string;
  includeDate: boolean;
  randomDigits: number;
}

export class UniqueIdGenerator {
  /**
   * Generate sequential 10-digit hotel IDs starting from 1000000001
   */
  static async generateNumericHotelId(): Promise<number> {
    const { Hotel } = await import('@/models/Hotel');
    
    try {
      let nextId = 1000000001; // Starting ID from 1000000001
      
      // Keep checking if the ID exists and increment until we find an available one
      while (true) {
        const existingHotel = await Hotel.query()
          .select('hotel_id')
          .where('hotel_id', nextId.toString())
          .first();
        
        if (!existingHotel) {
          // ID is available, return it
          return nextId;
        }
        
        // ID exists, increment and try next one
        nextId++;
      }
    } catch (error) {
      console.error('Error generating sequential hotel ID:', error);
      // Fallback to starting ID if there's an error
      return 1000000001;
    }
  }

  /**
   * Generate sequential user IDs for a given hotel
   */
  static async generateSequentialUserId(hotelId: string): Promise<string> {
    const { HotelUser } = await import('@/models/HotelUser');
    
    try {
      // Get the highest existing user_id for this hotel
      const result = await HotelUser.query()
        .select('hotel_user_id')
        .where('hotel_id', hotelId)
        .whereRaw('hotel_user_id REGEXP "^[0-9]+$"') // Only numeric user_ids
        .orderByRaw('CAST(hotel_user_id AS UNSIGNED) DESC')
        .limit(1)
        .first();
      
      let nextId = 1; // Starting user ID for each hotel
      
      if (result && result.hotel_user_id) {
        const currentMaxId = parseInt(result.hotel_user_id);
        nextId = currentMaxId + 1;
      }
      
      return nextId.toString();
    } catch (error) {
      console.error('Error generating sequential user ID:', error);
      // Fallback to ID 1 if there's an error
      return '1';
    }
  }

  /**
   * Generate hotel user ID in format: [10-digit Hotel ID][1-digit User Type][4-digit User Number]
   * Example: 100000000110001 = Hotel 1000000001 + GOD Admin (1) + User 0001
   */
  static async generateHotelUserId(role: string, hotelId: string): Promise<string> {
    const { HotelUser } = await import('@/models/HotelUser');
    
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
      
      const existingUser = await HotelUser.query()
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
   * Get role permissions for hotel users
   */
  static getHotelRolePermissions(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      'Admin': ['all'],
      'Manager': ['staff_management', 'room_management', 'booking_management'],
      'Finance': ['financial_reports', 'billing'],
      'Front Desk': ['check_in', 'check_out', 'guest_management'],
      'Booking': ['booking_management', 'availability'],
      'Gatekeeper': ['access_control'],
      'Support': ['guest_support'],
      'Tech Support': ['technical_support'],
      'Service': ['room_service'],
      'Maintenance': ['maintenance_requests'],
      'Kitchen': ['kitchen_operations']
    };
    
    return permissions[role] || [];
  }

  /**
   * Validate if an ID is numeric
   */
  static validate(id: string): boolean {
    return /^[0-9]+$/.test(id);
  }

  /**
   * Generate simple development hotel ID for testing
   */
  static generateSimpleDevHotelId(): string {
    return Math.floor(Math.random() * 1000000).toString();
  }

  /**
   * Legacy method for backward compatibility - generates simple numeric ID
   */
  static generate(): string {
    return Math.floor(Math.random() * 1000000).toString();
  }
}