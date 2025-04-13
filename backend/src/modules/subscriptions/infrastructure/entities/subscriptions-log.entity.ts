import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationSubscription } from './subscriptions.entity';

@Entity('integration_subscription_audit_log')
export class IntegrationSubscriptionAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'subscription_id' })
  subscriptionId: string;

  @Column('jsonb', { name: 'old_value' })
  oldValue: Record<string, any>;

  @Column('jsonb', { name: 'new_value' })
  newValue: Record<string, any>;

  @Column('varchar')
  action: string;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('varchar', { name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => IntegrationSubscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: IntegrationSubscription;
}
