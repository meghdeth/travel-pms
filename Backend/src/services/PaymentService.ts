import { logger } from '@/utils/logger';
import { Payment, PaymentGatewayResponse, RefundDetails } from '@/models/Payment';
import { Booking } from '@/models/Booking';
import { JWTPayload } from '@/types/auth';
import Stripe from 'stripe';

export interface CreatePaymentRequest {
  booking_id: number;
  amount: number;
  currency?: string;
  payment_method: string;
  payment_gateway: string;
  description?: string;
  metadata?: any;
}

export interface ProcessPaymentRequest {
  payment_method_id?: string;
  payment_intent_id?: string;
  gateway_customer_id?: string;
  billing_details?: any;
}

export interface RefundRequest {
  amount?: number;
  reason: string;
}

export class PaymentService {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-07-30.basil'
    });
  }
  
  // Create a new payment record
  async createPayment(
    paymentData: CreatePaymentRequest,
    user: JWTPayload
  ): Promise<Payment> {
    try {
      // Verify booking exists and user has access
      const booking = await Booking.query()
        .findById(paymentData.booking_id)
        .withGraphFetched('[user, hotel]');
      
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Check if user has permission to create payment for this booking
      if (user.userType === 'user' && booking.user_id !== user.id) {
        throw new Error('Unauthorized to create payment for this booking');
      }
      
      const payment = await Payment.query().insert({
        booking_id: paymentData.booking_id,
        user_id: user.id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        payment_method: paymentData.payment_method as any,
        payment_gateway: paymentData.payment_gateway as any,
        description: paymentData.description,
        metadata: paymentData.metadata,
        status: 'pending'
      });
      
      return payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }
  
  // Process payment through Stripe
  async processStripePayment(
    paymentId: number,
    processData: ProcessPaymentRequest
  ): Promise<Payment> {
    try {
      const payment = await Payment.query()
        .findById(paymentId)
        .withGraphFetched('[booking, user]');
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (payment.status !== 'pending') {
        throw new Error('Payment is not in pending status');
      }
      
      // Create or retrieve payment intent
      let paymentIntent;
      if (payment.payment_intent_id) {
        paymentIntent = await this.stripe.paymentIntents.retrieve(payment.payment_intent_id);
      } else {
        paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(payment.amount * 100), // Convert to cents
          currency: payment.currency.toLowerCase(),
          payment_method: processData.payment_method_id,
          customer: processData.gateway_customer_id,
          description: payment.description || `Payment for booking ${payment.booking_id}`,
          metadata: {
            booking_id: payment.booking_id.toString(),
            payment_id: payment.id.toString(),
            ...payment.metadata
          },
          confirm: true,
          return_url: process.env.PAYMENT_RETURN_URL
        });
      }
      
      // Update payment with Stripe response
      const gatewayResponse: PaymentGatewayResponse = {
        transaction_id: paymentIntent.id,
        gateway_response: paymentIntent
      };
      
      let status: any = 'processing';
      let paidAt: string | undefined;
      
      if (paymentIntent.status === 'succeeded') {
        status = 'completed';
        paidAt = new Date().toISOString();
      } else if (paymentIntent.status === 'canceled') {
        status = 'failed';
      }
      
      // Get fee information from latest charge if available
      let gatewayFee: number | undefined;
      let netAmount: number | undefined;
      
      if (paymentIntent.latest_charge) {
        const charge = await this.stripe.charges.retrieve(paymentIntent.latest_charge as string);
        if (charge.balance_transaction) {
          const balanceTransaction = await this.stripe.balanceTransactions.retrieve(
            charge.balance_transaction as string
          );
          gatewayFee = balanceTransaction.fee / 100;
          netAmount = balanceTransaction.net / 100;
        }
      }
      
      const updatedPayment = await payment.$query().patchAndFetch({
        payment_intent_id: paymentIntent.id,
        gateway_transaction_id: paymentIntent.id,
        gateway_response: gatewayResponse,
        status,
        paid_at: paidAt,
        gateway_fee: gatewayFee,
        net_amount: netAmount
      });
      
      return updatedPayment;
    } catch (error) {
      logger.error('Error processing Stripe payment:', error);
      
      // Update payment status to failed
      await Payment.query().findById(paymentId).patch({
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_reason: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new Error('Failed to process payment');
    }
  }
  
  // Get payments with filters
  async getPayments(
    page: number,
    limit: number,
    filters: {
      booking_id?: number;
      user_id?: number;
      status?: string;
      payment_gateway?: string;
      date_from?: string;
      date_to?: string;
    },
    user?: JWTPayload
  ): Promise<{ payments: Payment[]; total: number; pages: number }> {
    try {
      let query = Payment.query()
        .withGraphFetched('[booking, user]')
        .orderBy('created_at', 'desc');
      
      // Apply filters
      if (filters.booking_id) {
        query = query.where('booking_id', filters.booking_id);
      }
      if (filters.user_id) {
        query = query.where('user_id', filters.user_id);
      }
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      if (filters.payment_gateway) {
        query = query.where('payment_gateway', filters.payment_gateway);
      }
      if (filters.date_from) {
        query = query.where('created_at', '>=', filters.date_from);
      }
      if (filters.date_to) {
        query = query.where('created_at', '<=', filters.date_to);
      }
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        query = query.whereExists(
          Payment.relatedQuery('booking')
            .whereExists(
              Booking.relatedQuery('hotel').where('vendor_id', user.id)
            )
        );
      } else if (user?.userType === 'user') {
        query = query.where('user_id', user.id);
      }
      
      const total = await query.resultSize();
      const payments = await query.page(page - 1, limit);
      
      return {
        payments: payments.results,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching payments:', error);
      throw new Error('Failed to fetch payments');
    }
  }
  
  // Get payment by ID
  async getPaymentById(id: number, user?: JWTPayload): Promise<Payment | null> {
    try {
      let query = Payment.query()
        .findById(id)
        .withGraphFetched('[booking.[hotel, user], user]');
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        query = query.whereExists(
          Payment.relatedQuery('booking')
            .whereExists(
              Booking.relatedQuery('hotel').where('vendor_id', user.id)
            )
        );
      } else if (user?.userType === 'user') {
        query = query.where('user_id', user.id);
      }
      
      const result = await query;
      return result || null;
    } catch (error) {
      logger.error('Error fetching payment:', error);
      throw new Error('Failed to fetch payment');
    }
  }
  
  // Refund payment
  async refundPayment(
    paymentId: number,
    refundData: RefundRequest,
    user: JWTPayload
  ): Promise<Payment> {
    try {
      const payment = await this.getPaymentById(paymentId, user);
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (!payment.canBeRefunded()) {
        throw new Error('Payment cannot be refunded');
      }
      
      const refundAmount = refundData.amount || payment.getRemainingRefundableAmount();
      
      if (refundAmount > payment.getRemainingRefundableAmount()) {
        throw new Error('Refund amount exceeds remaining refundable amount');
      }
      
      // Process refund through Stripe
      let stripeRefund;
      if (payment.payment_gateway === 'stripe' && payment.gateway_transaction_id) {
        stripeRefund = await this.stripe.refunds.create({
          payment_intent: payment.gateway_transaction_id,
          amount: Math.round(refundAmount * 100),
          reason: 'requested_by_customer',
          metadata: {
            payment_id: payment.id.toString(),
            refund_reason: refundData.reason
          }
        });
      }
      
      // Update payment with refund details
      const refundDetails: RefundDetails = {
        refund_id: stripeRefund?.id || `manual_${Date.now()}`,
        refund_amount: refundAmount,
        refund_reason: refundData.reason,
        refunded_at: new Date().toISOString(),
        gateway_refund_id: stripeRefund?.id
      };
      
      const currentRefunds = payment.refund_details || [];
      currentRefunds.push(refundDetails);
      
      const totalRefunded = payment.getTotalRefunded() + refundAmount;
      const newStatus = totalRefunded >= payment.amount ? 'refunded' : 'partially_refunded';
      
      const updatedPayment = await payment.$query().patchAndFetch({
        refund_details: currentRefunds,
        status: newStatus as any
      });
      
      return updatedPayment;
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }
  
  // Get payment statistics
  async getPaymentStats(
    filters: {
      date_from?: string;
      date_to?: string;
      payment_gateway?: string;
    },
    user?: JWTPayload
  ): Promise<{
    total_payments: number;
    completed_payments: number;
    failed_payments: number;
    pending_payments: number;
    total_amount: number;
    total_refunded: number;
    average_payment: number;
    gateway_breakdown: Record<string, number>;
  }> {
    try {
      let query = Payment.query();
      
      // Apply filters
      if (filters.date_from) {
        query = query.where('created_at', '>=', filters.date_from);
      }
      if (filters.date_to) {
        query = query.where('created_at', '<=', filters.date_to);
      }
      if (filters.payment_gateway) {
        query = query.where('payment_gateway', filters.payment_gateway);
      }
      
      // Apply role-based filtering
      if (user?.userType === 'vendor') {
        query = query.whereExists(
          Payment.relatedQuery('booking')
            .whereExists(
              Booking.relatedQuery('hotel').where('vendor_id', user.id)
            )
        );
      } else if (user?.userType === 'user') {
        query = query.where('user_id', user.id);
      }
      
      const payments = await query;
      
      const stats = {
        total_payments: payments.length,
        completed_payments: payments.filter((p: Payment) => p.status === 'completed').length,
        failed_payments: payments.filter((p: Payment) => p.status === 'failed').length,
        pending_payments: payments.filter((p: Payment) => p.isPending()).length,
        total_amount: payments
          .filter((p: Payment) => p.status === 'completed')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0),
        total_refunded: payments
          .reduce((sum: number, p: Payment) => sum + p.getTotalRefunded(), 0),
        average_payment: 0,
        gateway_breakdown: {} as Record<string, number>
      };
      
      if (stats.completed_payments > 0) {
        stats.average_payment = stats.total_amount / stats.completed_payments;
      }
      
      // Gateway breakdown
      payments.forEach((payment: Payment) => {
        if (payment.status === 'completed') {
          stats.gateway_breakdown[payment.payment_gateway] = 
            (stats.gateway_breakdown[payment.payment_gateway] || 0) + payment.amount;
        }
      });
      
      return stats;
    } catch (error) {
      logger.error('Error fetching payment stats:', error);
      throw new Error('Failed to fetch payment statistics');
    }
  }
}