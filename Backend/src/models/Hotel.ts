import { BaseModel } from './BaseModel';
import { Vendor } from './Vendor';
import { RoomType } from './RoomType';
import { Room } from './Room';
import { UniqueIdGenerator } from '../utils/uniqueIdGenerator';
import { QueryContext } from 'objection';

export class Hotel extends BaseModel {
  static get tableName() {
    return 'hotels';
  }

  hotel_id?: string;
  vendor_id!: number;
  name!: string;
  slug!: string;
  description?: string;
  address!: string;
  city!: string;
  state!: string;
  country!: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  star_rating!: number;
  check_in_time!: string;
  check_out_time!: string;
  cancellation_policy?: string;
  amenities?: any;
  images?: any;
  featured_image?: string;
  status!: 'active' | 'inactive' | 'pending';
  is_featured!: boolean;
  avg_rating!: number;
  total_reviews!: number;

  // Relationship properties
  vendor?: Vendor;
  roomTypes?: RoomType[];
  rooms?: Room[];

  static get relationMappings() {
    return {
      vendor: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Vendor,
        join: {
          from: 'hotels.vendor_id',
          to: 'vendors.id'
        }
      },
      roomTypes: {
        relation: BaseModel.HasManyRelation,
        modelClass: RoomType,
        join: {
          from: 'hotels.id',
          to: 'room_types.hotel_id'
        }
      },
      rooms: {
        relation: BaseModel.HasManyRelation,
        modelClass: Room,
        join: {
          from: 'hotels.id',
          to: 'rooms.hotel_id'
        }
      }
    };
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);
    
    // Generate numeric hotel_id starting from 1000000001
    if (!this.hotel_id) {
      const numericId = await UniqueIdGenerator.generateNumericHotelId();
      this.hotel_id = numericId.toString(); // Pure numeric ID without prefix
    }
    

  }
}