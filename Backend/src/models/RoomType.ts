import { BaseModel } from './BaseModel';
import { Hotel } from './Hotel';
import { Room } from './Room';

export class RoomType extends BaseModel {
  static get tableName() {
    return 'room_types';
  }

  hotel_id!: number;
  name!: string;
  description?: string;
  max_occupancy!: number;
  base_price!: number;
  amenities?: any;
  images?: any;
  status!: 'active' | 'inactive';

  // Relationship properties
  hotel?: Hotel;
  rooms?: Room[];

  static get relationMappings() {
    return {
      hotel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Hotel,
        join: {
          from: 'room_types.hotel_id',
          to: 'hotels.id'
        }
      },
      rooms: {
        relation: BaseModel.HasManyRelation,
        modelClass: Room,
        join: {
          from: 'room_types.id',
          to: 'rooms.room_type_id'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['hotel_id', 'name', 'max_occupancy', 'base_price'],
      properties: {
        ...super.jsonSchema.properties,
        hotel_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        max_occupancy: { type: 'integer', minimum: 1 },
        base_price: { type: 'number', minimum: 0 },
        amenities: { type: ['object', 'null'] },
        images: { type: ['object', 'null'] },
        status: { type: 'string', enum: ['active', 'inactive'] }
      }
    };
  }
}