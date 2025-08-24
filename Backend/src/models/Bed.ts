import { BaseModel } from './BaseModel';
import { Room } from './Room';
import { BedBooking } from './BedBooking';

export interface BedAmenities {
  has_locker: boolean;
  locker_size?: 'small' | 'medium' | 'large';
  has_reading_light: boolean;
  has_power_outlet: boolean;
  has_curtains: boolean;
  has_shelf: boolean;
  includes_linens: boolean;
  includes_towels: boolean;
}

export interface BedPricing {
  base_price: number;
  weekend_surcharge?: number;
  holiday_surcharge?: number;
  long_stay_discount?: number; // percentage for stays > 7 days
  currency: string;
}

export class Bed extends BaseModel {
  static get tableName() {
    return 'beds';
  }

  room_id!: number;
  bed_number!: string;
  bed_type!: 'single' | 'double' | 'queen' | 'king' | 'bunk';
  status!: 'available' | 'occupied' | 'maintenance';
  notes?: string;
  
  // Dormitory specific fields
  gender_restriction?: 'male' | 'female' | 'mixed';
  is_dormitory_bed!: boolean;
  amenities?: BedAmenities;
  pricing?: BedPricing;
  
  // Position in room
  position?: string; // 'window', 'door', 'corner', 'center'
  floor_level?: 'bottom' | 'top'; // for bunk beds
  
  // Booking restrictions
  min_stay_nights?: number;
  max_stay_nights?: number;
  advance_booking_days?: number;

  // Add relationship properties
  room?: Room;
  bedBookings?: BedBooking[];

  static get relationMappings() {
    return {
      room: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'beds.room_id',
          to: 'rooms.id'
        }
      },
      bedBookings: {
        relation: BaseModel.HasManyRelation,
        modelClass: BedBooking,
        join: {
          from: 'beds.id',
          to: 'bed_bookings.bed_id'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['room_id', 'bed_number', 'bed_type', 'is_dormitory_bed'],
      properties: {
        ...super.jsonSchema.properties,
        room_id: { type: 'integer' },
        bed_number: { type: 'string', minLength: 1, maxLength: 50 },
        bed_type: { 
          type: 'string', 
          enum: ['single', 'double', 'queen', 'king', 'bunk'] 
        },
        status: { 
          type: 'string', 
          enum: ['available', 'occupied', 'maintenance'] 
        },
        notes: { type: ['string', 'null'] },
        gender_restriction: { type: ['string', 'null'], enum: ['male', 'female', 'mixed'] },
        is_dormitory_bed: { type: 'boolean' },
        amenities: {
          type: ['object', 'null'],
          properties: {
            has_locker: { type: 'boolean' },
            locker_size: { type: ['string', 'null'], enum: ['small', 'medium', 'large'] },
            has_reading_light: { type: 'boolean' },
            has_power_outlet: { type: 'boolean' },
            has_curtains: { type: 'boolean' },
            has_shelf: { type: 'boolean' },
            includes_linens: { type: 'boolean' },
            includes_towels: { type: 'boolean' }
          }
        },
        pricing: {
          type: ['object', 'null'],
          properties: {
            base_price: { type: 'number', minimum: 0 },
            weekend_surcharge: { type: ['number', 'null'], minimum: 0 },
            holiday_surcharge: { type: ['number', 'null'], minimum: 0 },
            long_stay_discount: { type: ['number', 'null'], minimum: 0, maximum: 100 },
            currency: { type: 'string', minLength: 3, maxLength: 3 }
          }
        },
        position: { type: ['string', 'null'], enum: ['window', 'door', 'corner', 'center'] },
        floor_level: { type: ['string', 'null'], enum: ['bottom', 'top'] },
        min_stay_nights: { type: ['integer', 'null'], minimum: 1 },
        max_stay_nights: { type: ['integer', 'null'], minimum: 1 },
        advance_booking_days: { type: ['integer', 'null'], minimum: 0 }
      }
    };
  }
  
  // Helper methods
  isAvailableForDates(checkIn: Date, checkOut: Date): boolean {
    if (this.status !== 'available') {
      return false;
    }
    
    // Check if there are any overlapping bookings
    if (this.bedBookings) {
      return !this.bedBookings.some(booking => {
        if (!booking.isActive()) return false;
        
        const bookingCheckIn = new Date(booking.check_in_date);
        const bookingCheckOut = new Date(booking.check_out_date);
        
        return (checkIn < bookingCheckOut && checkOut > bookingCheckIn);
      });
    }
    
    return true;
  }
  
  calculatePrice(checkIn: Date, checkOut: Date): number {
    if (!this.pricing) return 0;
    
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    let totalPrice = this.pricing.base_price * nights;
    
    // Apply weekend surcharge
    if (this.pricing.weekend_surcharge) {
      const weekendNights = this.countWeekendNights(checkIn, checkOut);
      totalPrice += weekendNights * this.pricing.weekend_surcharge;
    }
    
    // Apply long stay discount
    if (this.pricing.long_stay_discount && nights > 7) {
      totalPrice *= (1 - this.pricing.long_stay_discount / 100);
    }
    
    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
  }
  
  private countWeekendNights(checkIn: Date, checkOut: Date): number {
    let count = 0;
    const current = new Date(checkIn);
    
    while (current < checkOut) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}