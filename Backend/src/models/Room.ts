import { BaseModel } from './BaseModel';
import { Hotel } from './Hotel';
import { RoomType } from './RoomType';
import { Bed } from './Bed';

export class Room extends BaseModel {
  static get tableName() {
    return 'rooms';
  }

  hotel_id!: number;
  room_type_id!: number;
  room_number!: string;
  floor_number?: number;
  status!: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  notes?: string;

  // Relationship properties
  hotel?: Hotel;
  roomType?: RoomType;
  beds?: Bed[];

  static get relationMappings() {
    return {
      hotel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Hotel,
        join: {
          from: 'rooms.hotel_id',
          to: 'hotels.id'
        }
      },
      roomType: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RoomType,
        join: {
          from: 'rooms.room_type_id',
          to: 'room_types.id'
        }
      },
      beds: {
        relation: BaseModel.HasManyRelation,
        modelClass: Bed,
        join: {
          from: 'rooms.id',
          to: 'beds.room_id'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['hotel_id', 'room_type_id', 'room_number'],
      properties: {
        ...super.jsonSchema.properties,
        hotel_id: { type: 'integer' },
        room_type_id: { type: 'integer' },
        room_number: { type: 'string', minLength: 1, maxLength: 50 },
        floor_number: { type: ['integer', 'null'] },
        status: { 
          type: 'string', 
          enum: ['available', 'occupied', 'maintenance', 'out_of_order'] 
        },
        notes: { type: ['string', 'null'] }
      }
    };
  }
}