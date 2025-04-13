import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationProduct } from '@/modules/products/infrastructure/entities/products.entity';
import { IntegrationUser } from '@/modules/users/infrastructure/entities/users.entity';

@Entity('integration_subscriptions')
export class IntegrationSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('uuid', { name: 'user_id' })
  integrationUserId: string;

  @ManyToOne(() => IntegrationProduct, (product) => product.subscriptionTerms)
  @JoinColumn({ name: 'product_id' })
  product: IntegrationProduct;

  // Product ID to get the subscription terms
  @Column('uuid', { name: 'product_id' })
  integrationProductId: string;
  // For now should get total_count =  time period * billing frequency

  @Column('varchar', { name: 'status', default: 'CREATED' })
  status: string;

  @Column('varchar', { name: 'pgy_subscription_id' })
  pgySubscriptionId: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: new Date(),
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: new Date(),
  })
  updatedAt: Date;

  @Column('timestamp with time zone', {
    name: 'deleted_at',
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;
}
