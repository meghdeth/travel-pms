import { Model, QueryContext } from 'objection';

export class BaseModel extends Model {
  id!: number;
  created_at!: string;
  updated_at!: string;

  static get tableName() {
    return '';
  }

  // Helper method to format date for MySQL
  private formatDateForMySQL(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  $beforeInsert(queryContext: QueryContext) {
    const now = new Date();
    this.created_at = this.formatDateForMySQL(now);
    this.updated_at = this.formatDateForMySQL(now);
  }

  $beforeUpdate(opt: any, queryContext: QueryContext) {
    this.updated_at = this.formatDateForMySQL(new Date());
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }
}