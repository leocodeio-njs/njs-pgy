import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IntegrationProduct } from './products.entity';

@Entity('integration_subscription_terms')
export class IntegrationSubscriptionTerms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @Column('integer', { name: 'term_period' })
  termPeriod: number;

  @Column({
    type: 'enum',
    enum: ['DAY', 'MONTH', 'YEAR'],
    name: 'term_uom',
  })
  termUom: string;

  @Column('integer', { name: 'trial_period_days', nullable: true })
  trialPeriodDays: number;

  @Column({
    type: 'enum',
    enum: ['MONTHLY', 'YEARLY'],
    name: 'billing_frequency',
  })
  billingFrequency: string;

  @Column('date', { name: 'eol_date', nullable: true })
  eolDate: Date;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => IntegrationProduct, (product) => product.subscriptionTerms)
  @JoinColumn({ name: 'product_id' })
  product: IntegrationProduct;
}
