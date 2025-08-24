import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { ENVIRONMENTS, LOG_LEVELS } from '../constants';

// Database connection configuration
export interface DatabaseConfig {
  uri: string;
  options?: ConnectOptions;
  retryAttempts?: number;
  retryDelay?: number;
}

// Database connection manager
export class DatabaseManager {
  private static connections: Map<string, Connection> = new Map();
  private static isConnecting: Map<string, boolean> = new Map();

  /**
   * Create a database connection
   */
  static async connect(config: DatabaseConfig, connectionName: string = 'default'): Promise<Connection> {
    // Return existing connection if available
    if (this.connections.has(connectionName)) {
      const existingConnection = this.connections.get(connectionName)!;
      if (existingConnection.readyState === 1) {
        return existingConnection;
      }
    }

    // Prevent multiple connection attempts
    if (this.isConnecting.get(connectionName)) {
      throw new Error(`Already attempting to connect to database: ${connectionName}`);
    }

    this.isConnecting.set(connectionName, true);

    try {
      const defaultOptions: ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
        retryWrites: true,
        retryReads: true,
        ...(config.options || {})
      };

      let connection: Connection;
      
      if (connectionName === 'default') {
        await mongoose.connect(config.uri, defaultOptions);
        connection = mongoose.connection;
      } else {
        connection = mongoose.createConnection(config.uri, defaultOptions);
      }

      // Set up connection event handlers
      this.setupConnectionHandlers(connection, connectionName);

      // Store the connection
      this.connections.set(connectionName, connection);
      
      console.log(`✅ Database connected successfully: ${connectionName}`);
      return connection;
    } catch (error) {
      console.error(`❌ Database connection failed: ${connectionName}`, error);
      throw error;
    } finally {
      this.isConnecting.set(connectionName, false);
    }
  }

  /**
   * Get an existing database connection
   */
  static getConnection(connectionName: string = 'default'): Connection | null {
    return this.connections.get(connectionName) || null;
  }

  /**
   * Close a database connection
   */
  static async disconnect(connectionName: string = 'default'): Promise<void> {
    const connection = this.connections.get(connectionName);
    
    if (connection) {
      await connection.close();
      this.connections.delete(connectionName);
      console.log(`🔌 Database disconnected: ${connectionName}`);
    }
  }

  /**
   * Close all database connections
   */
  static async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys()).map(name => 
      this.disconnect(name)
    );
    
    await Promise.all(disconnectPromises);
    console.log('🔌 All database connections closed');
  }

  /**
   * Check if a connection is healthy
   */
  static isHealthy(connectionName: string = 'default'): boolean {
    const connection = this.connections.get(connectionName);
    return connection ? connection.readyState === 1 : false;
  }

  /**
   * Get connection status
   */
  static getConnectionStatus(connectionName: string = 'default'): string {
    const connection = this.connections.get(connectionName);
    
    if (!connection) {
      return 'disconnected';
    }

    switch (connection.readyState) {
      case 0:
        return 'disconnected';
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      case 3:
        return 'disconnecting';
      default:
        return 'unknown';
    }
  }

  /**
   * Setup connection event handlers
   */
  private static setupConnectionHandlers(connection: Connection, connectionName: string): void {
    connection.on('connected', () => {
      console.log(`📡 Database connected: ${connectionName}`);
    });

    connection.on('error', (error) => {
      console.error(`❌ Database error on ${connectionName}:`, error);
    });

    connection.on('disconnected', () => {
      console.log(`📡 Database disconnected: ${connectionName}`);
    });

    connection.on('reconnected', () => {
      console.log(`🔄 Database reconnected: ${connectionName}`);
    });

    connection.on('close', () => {
      console.log(`🔒 Database connection closed: ${connectionName}`);
    });
  }

  /**
   * Create database configuration from environment variables
   */
  static createConfigFromEnv(serviceName: string): DatabaseConfig {
    const envPrefix = serviceName.toUpperCase().replace('-', '_');
    const mongoUri = process.env[`${envPrefix}_MONGODB_URI`] || 
                    process.env.MONGODB_URI || 
                    `mongodb://localhost:27017/${serviceName}`;

    return {
      uri: mongoUri,
      options: {
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
        serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '5000'),
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000')
      }
    };
  }
}

// Common database utilities
export class DatabaseUtils {
  /**
   * Check if a value is a valid MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * Convert string to ObjectId
   */
  static toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  /**
   * Generate a new ObjectId
   */
  static generateObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }

  /**
   * Build aggregation pipeline for pagination
   */
  static buildPaginationPipeline(page: number = 1, limit: number = 10, sortField: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    return [
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
          page: { $literal: page },
          limit: { $literal: limit },
          totalPages: {
            $ceil: {
              $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit]
            }
          },
          hasNextPage: {
            $gt: [
              { $arrayElemAt: ['$totalCount.count', 0] },
              { $multiply: [page, limit] }
            ]
          },
          hasPrevPage: { $gt: [page, 1] }
        }
      }
    ];
  }

  /**
   * Build search pipeline with text search
   */
  static buildSearchPipeline(searchQuery: string, searchFields: string[] = []) {
    if (!searchQuery) {
      return [];
    }

    if (searchFields.length === 0) {
      // Use text search if no specific fields provided
      return [
        {
          $match: {
            $text: { $search: searchQuery }
          }
        },
        {
          $addFields: {
            score: { $meta: 'textScore' }
          }
        },
        {
          $sort: { score: { $meta: 'textScore' } }
        }
      ];
    }

    // Build regex search for specific fields
    const searchConditions = searchFields.map(field => ({
      [field]: { $regex: searchQuery, $options: 'i' }
    }));

    return [
      {
        $match: {
          $or: searchConditions
        }
      }
    ];
  }

  /**
   * Build date range filter
   */
  static buildDateRangeFilter(field: string, startDate?: Date, endDate?: Date) {
    const filter: any = {};

    if (startDate || endDate) {
      filter[field] = {};
      
      if (startDate) {
        filter[field].$gte = startDate;
      }
      
      if (endDate) {
        filter[field].$lte = endDate;
      }
    }

    return filter;
  }

  /**
   * Sanitize sort parameters
   */
  static sanitizeSortParams(sort?: string, allowedFields: string[] = []): Record<string, 1 | -1> {
    if (!sort) {
      return { createdAt: -1 };
    }

    const sortObj: Record<string, 1 | -1> = {};
    const sortPairs = sort.split(',');

    for (const pair of sortPairs) {
      const [field, order] = pair.trim().split(':');
      
      if (allowedFields.length === 0 || allowedFields.includes(field)) {
        sortObj[field] = order === 'asc' ? 1 : -1;
      }
    }

    return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
  }

  /**
   * Create database indexes
   */
  static async createIndexes(model: any, indexes: Array<{ fields: Record<string, any>, options?: any }>) {
    try {
      for (const index of indexes) {
        await model.createIndex(index.fields, index.options || {});
      }
      console.log(`✅ Indexes created for ${model.modelName}`);
    } catch (error) {
      console.error(`❌ Failed to create indexes for ${model.modelName}:`, error);
    }
  }

  /**
   * Perform database health check
   */
  static async healthCheck(connection?: Connection): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      readyState: number;
      host: string;
      port: number;
      name: string;
    };
  }> {
    const conn = connection || mongoose.connection;
    
    try {
      // Try to perform a simple operation
      await conn.db.admin().ping();
      
      return {
        status: 'healthy',
        details: {
          readyState: conn.readyState,
          host: conn.host,
          port: conn.port,
          name: conn.name
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          readyState: conn.readyState,
          host: conn.host,
          port: conn.port,
          name: conn.name
        }
      };
    }
  }
}

// Transaction helper
export class TransactionManager {
  /**
   * Execute operations within a transaction
   */
  static async withTransaction<T>(
    operations: (session: mongoose.ClientSession) => Promise<T>,
    connection?: Connection
  ): Promise<T> {
    const conn = connection || mongoose.connection;
    const session = await conn.startSession();
    
    try {
      session.startTransaction();
      
      const result = await operations(session);
      
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Execute multiple operations in parallel within a transaction
   */
  static async withParallelTransaction<T>(
    operations: Array<(session: mongoose.ClientSession) => Promise<any>>,
    connection?: Connection
  ): Promise<T[]> {
    const conn = connection || mongoose.connection;
    const session = await conn.startSession();
    
    try {
      session.startTransaction();
      
      const results = await Promise.all(
        operations.map(operation => operation(session))
      );
      
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

// Schema helpers
export class SchemaHelpers {
  /**
   * Add common fields to schema
   */
  static addCommonFields(schema: mongoose.Schema) {
    schema.add({
      createdAt: {
        type: Date,
        default: Date.now,
        index: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      isDeleted: {
        type: Boolean,
        default: false,
        index: true
      },
      deletedAt: {
        type: Date,
        default: null
      }
    });

    // Update the updatedAt field on save
    schema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
    });

    // Update the updatedAt field on findOneAndUpdate
    schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
      this.set({ updatedAt: new Date() });
      next();
    });

    return schema;
  }

  /**
   * Add soft delete functionality
   */
  static addSoftDelete(schema: mongoose.Schema) {
    // Override find methods to exclude deleted documents
    schema.pre(['find', 'findOne', 'findOneAndUpdate', 'count', 'countDocuments'], function() {
      if (!this.getQuery().isDeleted) {
        this.where({ isDeleted: { $ne: true } });
      }
    });

    // Add soft delete method
    schema.methods.softDelete = function() {
      this.isDeleted = true;
      this.deletedAt = new Date();
      return this.save();
    };

    // Add restore method
    schema.methods.restore = function() {
      this.isDeleted = false;
      this.deletedAt = null;
      return this.save();
    };

    return schema;
  }

  /**
   * Add text search index
   */
  static addTextSearch(schema: mongoose.Schema, fields: Record<string, 'text'>) {
    schema.index(fields);
    return schema;
  }

  /**
   * Add compound indexes
   */
  static addCompoundIndexes(schema: mongoose.Schema, indexes: Array<{ fields: Record<string, any>, options?: any }>) {
    indexes.forEach(index => {
      schema.index(index.fields, index.options || {});
    });
    return schema;
  }
}

// Export all utilities
export const database = {
  DatabaseManager,
  DatabaseUtils,
  TransactionManager,
  SchemaHelpers
};