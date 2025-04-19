import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationProduct } from '@/modules/products/infrastructure/entities/products.entity';
import { IntegrationUser } from '@/modules/users/infrastructure/entities/users.entity';

@Entity('integration_invoices')
export class IntegrationInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'integration_user_id' })
  integrationUserId: string;

  @Column('varchar', { name: 'status', default: 'CREATED' })
  status: string;

  @Column('varchar', { name: 'pgy_subscription_id' })
  pgySubscriptionId: string;

  @Column('varchar', { name: 'razorpay_invoice_id', nullable: true })
  razorpayInvoiceId: string;

  @Column('varchar', { name: 'razorpay_order_id', nullable: true })
  razorpayOrderId: string;

  @Column('varchar', { name: 'razorpay_payment_id', nullable: true })
  razorpayPaymentId: string;

  @Column('varchar', { name: 'razorpay_customer_id', nullable: true })
  razorpayCustomerId: string;

  @Column('varchar', { name: 'invoice_number', nullable: true })
  invoiceNumber: string;

  @Column('decimal', {
    name: 'amount',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amount: number;

  @Column('decimal', {
    name: 'amount_paid',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amountPaid: number;

  @Column('decimal', {
    name: 'amount_due',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amountDue: number;

  @Column('varchar', { name: 'currency', nullable: true, default: 'INR' })
  currency: string;

  @Column('varchar', { name: 'short_url', nullable: true })
  shortUrl: string;

  @Column('timestamp with time zone', { name: 'issued_at', nullable: true })
  issuedAt: Date;

  @Column('timestamp with time zone', { name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column('timestamp with time zone', { name: 'billing_start', nullable: true })
  billingStart: Date;

  @Column('timestamp with time zone', { name: 'billing_end', nullable: true })
  billingEnd: Date;

  @Column('jsonb', { name: 'line_items', nullable: true, default: '[]' })
  lineItems: any;

  @Column('jsonb', { name: 'customer_details', nullable: true, default: '{}' })
  customerDetails: any;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column('timestamp with time zone', {
    name: 'deleted_at',
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;
}
