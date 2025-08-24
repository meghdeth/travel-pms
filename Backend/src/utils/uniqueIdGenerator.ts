export interface UniqueIdConfig {
  prefix: string;
  includeDate: boolean;
  randomDigits: number;
}

export class UniqueIdGenerator {
  /**
   * Generate sequential 10-digit hotel IDs starting from 1000000000
   */
  static async generateNumericHotelId(): Promise<number> {
    const { Hotel } = await import('@/models/Hotel');
    
    try {
      // Get the highest existing hotel_id
      const result = await Hotel.query()
        .select('hotel_id')
        .whereRaw('hotel_id REGEXP "^[0-9]+$"') // Only numeric hotel_ids
        .orderByRaw('CAST(hotel_id AS UNSIGNED) DESC')
        .limit(1)
        .first();
      
      let nextId = 1000000000; // Starting ID
      
      if (result && result.hotel_id) {
        const currentMaxId = parseInt(result.hotel_id);
        if (currentMaxId >= 1000000000) {
          nextId = currentMaxId + 1;
        }
      }
      
      return nextId;
    } catch (error) {
      console.error('Error generating sequential hotel ID:', error);
      // Fallback to starting ID if there's an error
      return 1000000000;
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
   * Generate complex format hotel user ID: [entity_type][role][hotel_type][10_digit_hotel_id][5_digit_user_sequence]
   */
  static generateHotelUserId(role: string, hotelId: string): string {
    const entityType = '1'; // 1 for hotel users
    let roleType;
    switch(role) {
      case 'Hotel Admin': roleType = '1'; break;
      case 'Manager': roleType = '2'; break;
      case 'Front Desk': roleType = '4'; break;
      default: roleType = '9'; break;
    }
    const hotelType = '1'; // 1 for standard hotels
    const hotelIdPadded = hotelId.toString().padStart(10, '0');
    const userSequence = '00001'; // Default to 1 for new users
    
    return `${entityType}${roleType}${hotelType}${hotelIdPadded}${userSequence}`;
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