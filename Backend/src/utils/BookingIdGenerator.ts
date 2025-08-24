import { Hotel } from '@/models/Hotel';

export class BookingIdGenerator {
  /**
   * Generate unique booking ID following pattern:
   * BOOK<vendorid/hotelid><date><roomid/bedid><random4digits>
   */
  static async generateBookingId(
    hotel_id: number,
    room_id: number,
    bed_id?: number,
    check_in_date?: Date
  ): Promise<string> {
    try {
      // Get hotel information to determine vendor_id
      const hotel = await Hotel.query().findById(hotel_id);
      if (!hotel) {
        throw new Error('Hotel not found');
      }

      // Use vendor_id if available, otherwise use hotel_id
      const entityId = hotel.vendor_id || hotel.id;
      
      // Format date as YYYYMMDD
      const date = check_in_date || new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Use bed_id if provided (for dormitory bookings), otherwise room_id
      const accommodationId = bed_id || room_id;
      
      // Generate random 4-digit number
      const randomId = Math.floor(1000 + Math.random() * 9000);
      
      // Construct booking ID
      const bookingId = `BOOK${entityId}${dateStr}${accommodationId}${randomId}`;
      
      return bookingId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate booking ID: ${errorMessage}`);
    }
  }

  /**
   * Parse booking ID to extract components
   */
  static parseBookingId(bookingId: string): {
    entityId: string;
    date: string;
    accommodationId: string;
    randomId: string;
  } | null {
    // Pattern: BOOK + entityId + date(8) + accommodationId + randomId(4)
    const match = bookingId.match(/^BOOK(\d+)(\d{8})(\d+)(\d{4})$/);
    
    if (!match) {
      return null;
    }
    
    return {
      entityId: match[1],
      date: match[2],
      accommodationId: match[3],
      randomId: match[4]
    };
  }

  /**
   * Validate booking ID format
   */
  static isValidBookingId(bookingId: string): boolean {
    return this.parseBookingId(bookingId) !== null;
  }
}