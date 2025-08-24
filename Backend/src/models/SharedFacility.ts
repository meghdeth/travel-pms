import { BaseModel } from './BaseModel';
import { Hotel } from './Hotel';
import { Room } from './Room';

export interface FacilitySchedule {
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open_time: string; // HH:MM format
  close_time: string; // HH:MM format
  is_24_hours: boolean;
}

export interface FacilityMaintenance {
  last_cleaned: Date;
  next_maintenance: Date;
  maintenance_notes?: string;
  is_out_of_order: boolean;
}

export class SharedFacility extends BaseModel {
  static get tableName() {
    return 'shared_facilities';
  }

  hotel_id!: number;
  room_id?: number; // null means hotel-wide facility
  facility_type!: 'bathroom' | 'kitchen' | 'lounge' | 'laundry' | 'balcony' | 'terrace' | 'gym' | 'study_room' | 'game_room' | 'tv_room' | 'dining_area' | 'storage' | 'other';
  name!: string;
  description?: string;
  location!: string; // floor, wing, etc.
  capacity?: number; // max people at once
  gender_restriction?: 'male' | 'female' | 'mixed';
  
  // Amenities within the facility
  amenities!: string[]; // ['wifi', 'ac', 'tv', 'microwave', 'refrigerator', 'washing_machine', 'dryer', 'lockers', 'seating', 'tables', 'shower', 'toilet', 'sink', 'mirror', 'hair_dryer']
  
  // Availability
  is_available!: boolean;
  schedule?: FacilitySchedule[];
  requires_booking?: boolean;
  max_booking_duration?: number; // in minutes
  
  // Maintenance
  maintenance!: FacilityMaintenance;
  
  // Rules and policies
  rules?: string[];
  cleaning_fee?: number;
  deposit_required?: number;
  
  // Status
  status!: 'active' | 'maintenance' | 'out_of_order' | 'temporarily_closed';
  notes?: string;

  // Relationship properties
  hotel?: Hotel;
  room?: Room;

  static get relationMappings() {
    return {
      hotel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Hotel,
        join: {
          from: 'shared_facilities.hotel_id',
          to: 'hotels.id'
        }
      },
      room: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'shared_facilities.room_id',
          to: 'rooms.id'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['hotel_id', 'facility_type', 'name', 'location', 'amenities', 'is_available', 'maintenance', 'status'],
      properties: {
        ...super.jsonSchema.properties,
        hotel_id: { type: 'integer' },
        room_id: { type: ['integer', 'null'] },
        facility_type: { 
          type: 'string', 
          enum: ['bathroom', 'kitchen', 'lounge', 'laundry', 'balcony', 'terrace', 'gym', 'study_room', 'game_room', 'tv_room', 'dining_area', 'storage', 'other'] 
        },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        description: { type: ['string', 'null'] },
        location: { type: 'string', minLength: 1, maxLength: 100 },
        capacity: { type: ['integer', 'null'], minimum: 1 },
        gender_restriction: { type: ['string', 'null'], enum: ['male', 'female', 'mixed'] },
        amenities: {
          type: 'array',
          items: { type: 'string' }
        },
        is_available: { type: 'boolean' },
        schedule: {
          type: ['array', 'null'],
          items: {
            type: 'object',
            required: ['day_of_week', 'open_time', 'close_time', 'is_24_hours'],
            properties: {
              day_of_week: { type: 'string', enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
              open_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
              close_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
              is_24_hours: { type: 'boolean' }
            }
          }
        },
        requires_booking: { type: ['boolean', 'null'] },
        max_booking_duration: { type: ['integer', 'null'], minimum: 1 },
        maintenance: {
          type: 'object',
          required: ['last_cleaned', 'next_maintenance', 'is_out_of_order'],
          properties: {
            last_cleaned: { type: 'string', format: 'date-time' },
            next_maintenance: { type: 'string', format: 'date-time' },
            maintenance_notes: { type: ['string', 'null'] },
            is_out_of_order: { type: 'boolean' }
          }
        },
        rules: {
          type: ['array', 'null'],
          items: { type: 'string' }
        },
        cleaning_fee: { type: ['number', 'null'], minimum: 0 },
        deposit_required: { type: ['number', 'null'], minimum: 0 },
        status: { type: 'string', enum: ['active', 'maintenance', 'out_of_order', 'temporarily_closed'] },
        notes: { type: ['string', 'null'] }
      }
    };
  }

  // Helper methods
  isAvailableNow(): boolean {
    if (!this.is_available || this.status !== 'active') {
      return false;
    }
    
    if (this.maintenance.is_out_of_order) {
      return false;
    }
    
    if (!this.schedule || this.schedule.length === 0) {
      return true; // No schedule means always available
    }
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
    
    const todaySchedule = this.schedule.find(s => s.day_of_week === currentDay);
    if (!todaySchedule) {
      return false;
    }
    
    if (todaySchedule.is_24_hours) {
      return true;
    }
    
    return currentTime >= todaySchedule.open_time && currentTime <= todaySchedule.close_time;
  }
  
  needsMaintenance(): boolean {
    return new Date() >= new Date(this.maintenance.next_maintenance);
  }
  
  isOverdue(): boolean {
    const daysSinceLastCleaning = Math.floor((Date.now() - new Date(this.maintenance.last_cleaned).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastCleaning > 7; // Consider overdue if not cleaned for more than 7 days
  }
}