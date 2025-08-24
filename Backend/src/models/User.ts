import { BaseModel } from './BaseModel';
import bcrypt from 'bcryptjs';
import { QueryContext } from 'objection';

export class User extends BaseModel {
  static get tableName() {
    return 'users';
  }

  first_name!: string;
  last_name!: string;
  username!: string;
  email!: string;
  password!: string;
  contact_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status!: 'active' | 'inactive' | 'banned';
  email_verified!: boolean;
  email_verified_at?: string;
  avatar?: string;
  verification_token?: string | null;

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  static get relationMappings() {
    return {
      roomBookings: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'RoomBooking',
        join: {
          from: 'users.id',
          to: 'room_bookings.user_id'
        }
      },
      packageBookings: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'PackageBooking',
        join: {
          from: 'users.id',
          to: 'package_bookings.user_id'
        }
      }
    };
  }
}