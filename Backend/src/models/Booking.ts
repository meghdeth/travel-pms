import { BaseModel } from './BaseModel';
import { User } from './User';
import { Hotel } from './Hotel';
import { Room } from './Room';
import { RoomType } from './RoomType';

export interface BookingGuest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  age?: number;
}

export interface BookingPricing {
  room_rate: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
}

export interface BookingPayment {
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  transaction_id?: string;
  payment_gateway?: string;
  paid_amount: number;
  payment_date?: Date;
}

export class Booking extends BaseModel {
  static get tableName() {
    return 'bookings';
  }

  // Basic booking information
  booking_reference!: string;
  user_id?: number;
  hotel_id!: number;
  room_id!: number;
  room_type_id!: number;

  // Guest information
  guest_details!: BookingGuest;
  adults!: number;
  children!: number;
  infants!: number;

  // Booking dates
  check_in_date!: Date;
  check_out_date!: Date;
  nights!: number;

  // Pricing details
  pricing!: BookingPricing;

  // Payment information
  payment!: BookingPayment;

  // Booking status and management
  status!: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  booking_source!: 'direct' | 'ota' | 'phone' | 'walk_in' | 'agent';
  special_requests?: string;
  internal_notes?: string;

  // Cancellation details
  cancelled_at?: Date;
  cancelled_by?: number;
  cancellation_reason?: string;
  refund_amount?: number;

  // Check-in/out details
  checked_in_at?: Date;
  checked_out_at?: Date;
  early_checkin?: boolean;
  late_checkout?: boolean;

  // Relationship properties
  user?: User;
  hotel?: Hotel;
  room?: Room;
  roomType?: RoomType;

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'bookings.user_id',
          to: 'users.id'
        }
      },
      hotel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Hotel,
        join: {
          from: 'bookings.hotel_id',
          to: 'hotels.id'
        }
      },
      room: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'bookings.room_id',
          to: 'rooms.id'
        }
      },
      roomType: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RoomType,
        join: {
          from: 'bookings.room_type_id',
          to: 'room_types.id'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'booking_reference',
        'hotel_id',
        'room_id',
        'room_type_id',
        'guest_details',
        'adults',
        'check_in_date',
        'check_out_date',
        'nights',
        'pricing',
        'payment',
        'status',
        'booking_source'
      ],
      properties: {
        id: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        booking_reference: { type: 'string', minLength: 6, maxLength: 20 },
        user_id: { type: ['integer', 'null'] },
        hotel_id: { type: 'integer' },
        room_id: { type: 'integer' },
        room_type_id: { type: 'integer' },
        guest_details: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'phone'],
          properties: {
            first_name: { type: 'string', minLength: 1, maxLength: 100 },
            last_name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', minLength: 10, maxLength: 20 },
            age: { type: ['integer', 'null'], minimum: 0, maximum: 150 }
          }
        },
        adults: { type: 'integer', minimum: 1, maximum: 20 },
        children: { type: 'integer', minimum: 0, maximum: 20 },
        infants: { type: 'integer', minimum: 0, maximum: 10 },
        check_in_date: { type: 'string', format: 'date' },
        check_out_date: { type: 'string', format: 'date' },
        nights: { type: 'integer', minimum: 1, maximum: 365 },
        pricing: {
          type: 'object',
          required: ['room_rate', 'tax_amount', 'service_charge', 'discount_amount', 'total_amount', 'currency'],
          properties: {
            room_rate: { type: 'number', minimum: 0 },
            tax_amount: { type: 'number', minimum: 0 },
            service_charge: { type: 'number', minimum: 0 },
            discount_amount: { type: 'number', minimum: 0 },
            total_amount: { type: 'number', minimum: 0 },
            currency: { type: 'string', minLength: 3, maxLength: 3 }
          }
        },
        payment: {
          type: 'object',
          required: ['payment_method', 'payment_status', 'paid_amount'],
          properties: {
            payment_method: {
              type: 'string',
              enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash']
            },
            payment_status: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']
            },
            transaction_id: { type: ['string', 'null'] },
            payment_gateway: { type: ['string', 'null'] },
            paid_amount: { type: 'number', minimum: 0 },
            payment_date: { type: ['string', 'null'], format: 'date-time' }
          }
        },
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']
        },
        booking_source: {
          type: 'string',
          enum: ['direct', 'ota', 'phone', 'walk_in', 'agent']
        },
        special_requests: { type: ['string', 'null'] },
        internal_notes: { type: ['string', 'null'] },
        cancelled_at: { type: ['string', 'null'], format: 'date-time' },
        cancelled_by: { type: ['integer', 'null'] },
        cancellation_reason: { type: ['string', 'null'] },
        refund_amount: { type: ['number', 'null'], minimum: 0 },
        checked_in_at: { type: ['string', 'null'], format: 'date-time' },
        checked_out_at: { type: ['string', 'null'], format: 'date-time' },
        early_checkin: { type: ['boolean', 'null'] },
        late_checkout: { type: ['boolean', 'null'] }
      }
    };
  }

  // Helper methods
  generateBookingReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `BK${timestamp}${random}`.toUpperCase();
  }

  calculateNights(): number {
    const checkIn = new Date(this.check_in_date);
    const checkOut = new Date(this.check_out_date);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  isActive(): boolean {
    return ['pending', 'confirmed', 'checked_in'].includes(this.status);
  }

  canBeCancelled(): boolean {
    return ['pending', 'confirmed'].includes(this.status);
  }

  canCheckIn(): boolean {
    return this.status === 'confirmed';
  }

  canCheckOut(): boolean {
    return this.status === 'checked_in';
  }
}