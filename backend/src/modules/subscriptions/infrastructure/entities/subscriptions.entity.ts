import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationProduct } from '@/modules/products/infrastructure/entities/products.entity';

@Entity('integration_subscriptions')
export class IntegrationSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'customer_id' })
  customerId: string;

  @Column('uuid', { name: 'plan_id' })
  planId: string;

  @Column('timestamp with time zone', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp with time zone', { name: 'updated_at' })
  updatedAt: Date;

  @Column('timestamp with time zone', { name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => IntegrationProduct, (product) => product.subscriptionTerms)
  @JoinColumn({ name: 'product_id' })
  product: IntegrationProduct;

  // Product ID to get the subscription terms
  @Column('uuid', { name: 'product_id' })
  integrationProductId: string;
  // For now should get total_count =  time period * billing frequency

  @Column('varchar', { name: 'status' })
  status: string;

  @Column('varchar', { name: 'pgy_subscription_id' })
  pgySubscriptionId: string;
}
