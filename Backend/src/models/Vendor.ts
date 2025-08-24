import { BaseModel } from './BaseModel';
import { Hotel } from './Hotel';
import bcrypt from 'bcryptjs';
import { QueryContext } from 'objection';

export class Vendor extends BaseModel {
  static get tableName() {
    return 'vendors';
  }

  username!: string;
  email!: string;
  password!: string;
  company_name!: string;
  contact_person!: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  avatar?: string;
  status!: 'active' | 'inactive' | 'suspended';
  hotel_limit!: number;
  commission_percentage!: number;
  subscription_plan!: 'basic' | 'premium' | 'enterprise';
  subscription_expires_at?: string;
  total_earnings!: number;
  available_balance!: number;
  email_verified_at?: string;

  static get relationMappings() {
    return {
      hotels: {
        relation: BaseModel.HasManyRelation,
        modelClass: Hotel,
        join: {
          from: 'vendors.id',
          to: 'hotels.vendor_id'
        }
      }
      // Removed VendorWebsite relation since the model doesn't exist yet
    };
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const json = super.toJSON() as any;
    delete json.password;
    return json;
  }
}