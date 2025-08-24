import { BaseModel } from './BaseModel';
import { Booking } from './Booking';
import { User } from './User';
import { Model } from 'objection';

export interface PaymentGatewayResponse {
  transaction_id: string;
  gateway_response: any;
}

export interface RefundDetails {
  refund_id: string;
  refund_amount: number;
  refund_reason: string;
  refunded_at: string;
  gateway_refund_id?: string;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash';
export type PaymentGateway = 'stripe' | 'paypal' | 'razorpay' | 'square' | 'manual';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

export class Payment extends BaseModel {
  static tableName = 'payments';
  
  id!: number;
  booking_id!: number;
  user_id!: number;
  amount!: number;
  currency!: string;
  payment_method!: PaymentMethod;
  payment_gateway!: PaymentGateway;
  status!: PaymentStatus;
  description?: string;
  metadata?: any;
  
  // Gateway specific fields
  payment_intent_id?: string;
  gateway_transaction_id?: string;
  gateway_response?: PaymentGatewayResponse;
  gateway_fee?: number;
  net_amount?: number;
  
  // Payment tracking
  paid_at?: string;
  failed_at?: string;
  failure_reason?: string;
  
  // Refund tracking
  refund_details?: RefundDetails[];
  
  // Relationships
  booking?: Booking;
  user?: User;
  
  static get relationMappings() {
    return {
      booking: {
        relation: Model.BelongsToOneRelation,
        modelClass: Booking,
        join: {
          from: 'payments.booking_id',
          to: 'bookings.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'payments.user_id',
          to: 'users.id'
        }
      }
    };
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['booking_id', 'user_id', 'amount', 'currency', 'payment_method', 'payment_gateway', 'status'],
      properties: {
        ...super.jsonSchema.properties,
        booking_id: { type: 'integer' },
        user_id: { type: 'integer' },
        amount: { type: 'number', minimum: 0 },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        payment_method: { 
          type: 'string', 
          enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash'] 
        },
        payment_gateway: { 
          type: 'string', 
          enum: ['stripe', 'paypal', 'razorpay', 'square', 'manual'] 
        },
        status: { 
          type: 'string', 
          enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'] 
        },
        description: { type: ['string', 'null'] },
        metadata: { type: ['object', 'null'] },
        payment_intent_id: { type: ['string', 'null'] },
        gateway_transaction_id: { type: ['string', 'null'] },
        gateway_response: { type: ['object', 'null'] },
        gateway_fee: { type: ['number', 'null'] },
        net_amount: { type: ['number', 'null'] },
        paid_at: { type: ['string', 'null'], format: 'date-time' },
        failed_at: { type: ['string', 'null'], format: 'date-time' },
        failure_reason: { type: ['string', 'null'] },
        refund_details: { type: ['array', 'null'] }
      }
    };
  }
  
  // Helper methods
  isPending(): boolean {
    return this.status === 'pending';
  }
  
  isCompleted(): boolean {
    return this.status === 'completed';
  }
  
  isFailed(): boolean {
    return this.status === 'failed';
  }
  
  canBeRefunded(): boolean {
    return this.status === 'completed' || this.status === 'partially_refunded';
  }
  
  getTotalRefunded(): number {
    if (!this.refund_details || this.refund_details.length === 0) {
      return 0;
    }
    return this.refund_details.reduce((total, refund) => total + refund.refund_amount, 0);
  }
  
  getRemainingRefundableAmount(): number {
    return this.amount - this.getTotalRefunded();
  }
}