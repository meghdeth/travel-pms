import { BaseModel } from './BaseModel';
import { QueryContext } from 'objection';
import bcrypt from 'bcryptjs';

export class SuperAdmin extends BaseModel {
  static get tableName() {
    return 'super_admins';
  }

  username!: string;
  email!: string;
  password!: string;
  first_name!: string;
  last_name!: string;
  avatar?: string;
  status!: 'active' | 'inactive';

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'email', 'password', 'first_name', 'last_name'],
      properties: {
        ...super.jsonSchema.properties,
        username: { type: 'string', minLength: 3, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        first_name: { type: 'string', minLength: 1, maxLength: 100 },
        last_name: { type: 'string', minLength: 1, maxLength: 100 },
        avatar: { type: ['string', 'null'] },
        status: { type: 'string', enum: ['active', 'inactive'] }
      }
    };
  }

  $beforeInsert(queryContext: QueryContext) {
    super.$beforeInsert(queryContext);
    if (this.password) {
      this.password = bcrypt.hashSync(this.password, 12);
    }
  }

  $beforeUpdate(opt: any, queryContext: QueryContext) {
    super.$beforeUpdate(opt, queryContext);
    if (this.password) {
      this.password = bcrypt.hashSync(this.password, 12);
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