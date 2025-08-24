import { BaseModel } from './BaseModel';

export class Role extends BaseModel {
  static get tableName() {
    return 'roles';
  }

  name!: string;
  permissions!: string;
  parent_role_id?: number;
  hierarchy_level!: number;
  role_type!: 'system' | 'vendor' | 'hotel_admin' | 'hotel_staff';
  restrictions?: string;
  can_create_sub_roles!: boolean;
  hotel_id?: number;
  vendor_id?: number;
  description?: string;
  status!: 'active' | 'inactive';

  // Relationship properties
  parentRole?: Role;
  childRoles?: Role[];
  admins?: any[];

  static get relationMappings() {
    return {
      parentRole: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'Role',
        join: {
          from: 'roles.parent_role_id',
          to: 'roles.id'
        }
      },
      childRoles: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Role',
        join: {
          from: 'roles.id',
          to: 'roles.parent_role_id'
        }
      },
      admins: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Admin',
        join: {
          from: 'roles.id',
          to: 'admins.role_id'
        }
      }
    };
  }

  getPermissions(): string[] {
    return JSON.parse(this.permissions || '[]');
  }

  getRestrictions(): any {
    return this.restrictions ? JSON.parse(this.restrictions) : {};
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes('*') || permissions.includes(permission);
  }

  canCreateSubRoles(): boolean {
    return this.can_create_sub_roles;
  }

  isHigherThan(otherRole: Role): boolean {
    return this.hierarchy_level < otherRole.hierarchy_level;
  }

  canManage(otherRole: Role): boolean {
    return this.isHigherThan(otherRole) || this.hierarchy_level === otherRole.hierarchy_level;
  }
}