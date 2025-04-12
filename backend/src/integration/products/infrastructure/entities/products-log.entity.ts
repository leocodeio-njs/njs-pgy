import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationProductEntity } from './products.entity';

@Entity('integration_product_audit_log')
export class IntegrationProductAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

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

  @ManyToOne(() => IntegrationProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: IntegrationProductEntity;
}
