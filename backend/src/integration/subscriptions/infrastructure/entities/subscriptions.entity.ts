import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationProductEntity } from '@/integration/products/infrastructure/entities/products.entity';

@Entity('integration_subscriptions')
export class IntegrationSubscriptionEntity {
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

  @ManyToOne(
    () => IntegrationProductEntity,
    (product) => product.subscriptionTerms,
  )
  @JoinColumn({ name: 'product_id' })
  product: IntegrationProductEntity;

  // Product ID to get the subscription terms
  @Column('uuid', { name: 'product_id' })
  productId: string;
  // For now should get total_count =  time period * billing frequency
}
