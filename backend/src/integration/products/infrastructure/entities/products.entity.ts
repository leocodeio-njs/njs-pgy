import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { IntegrationProductPricing } from './products-pricing.entity';
import { IntegrationSubscriptionTerms } from './subscription-terms.entity';

@Entity('integration_products')
export class IntegrationProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'business_id' })
  businessId: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['SUBSCRIPTION'],
  })
  type: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(
    () => IntegrationProductPricing,
    (pricing) => pricing.product,
    {
      cascade: true,
    },
  )
  pricing: IntegrationProductPricing[];

  @OneToMany(
    () => IntegrationSubscriptionTerms,
    (terms) => terms.product,
    {
      cascade: true,
    },
  )
  subscriptionTerms: IntegrationSubscriptionTerms[];

  @Column({ name: 'pgy_product_id', nullable: true })
  pgyProductId?: string;
}
