import { BaseModel } from './BaseModel';
import { Hotel } from './Hotel';
import bcrypt from 'bcryptjs';
import { QueryContext } from 'objection';
import { UniqueIdGenerator } from '../utils/uniqueIdGenerator';

export class HotelUser extends BaseModel {
  static get tableName() {
    return 'hotel_users';
  }

  hotel_user_id!: string;
  hotel_id!: string;
  email!: string;
  password!: string;
  first_name!: string;
  last_name!: string;
  phone?: string;
  role!: 'Hotel Admin' | 'Manager' | 'Finance Department' | 'Front Desk' | 
         'Booking Agent' | 'Gatekeeper' | 'Support' | 'Tech Support' | 
         'Service Boy' | 'Maintenance' | 'Kitchen';
  permissions!: string; // JSON string of permissions array
  status!: 'active' | 'inactive';
  last_login?: Date;
  created_by?: string; // hotel_user_id of creator (for audit)

  // Relationship properties
  hotel?: Hotel;
  createdBy?: HotelUser;

  static get relationMappings() {
    return {
      hotel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Hotel,
        join: {
          from: 'hotel_users.hotel_id',
          to: 'hotels.hotel_id'
        }
      },
      createdBy: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: HotelUser,
        join: {
          from: 'hotel_users.created_by',
          to: 'hotel_users.hotel_user_id'
        }
      }
    };
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);
    
    // Generate numeric hotel_user_id
    if (!this.hotel_user_id) {
      const numericId = await UniqueIdGenerator.generateNumericHotelId();
      this.hotel_user_id = `USR${numericId}`;
    }
    

    
    // Hash password if provided
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Add password verification method
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}