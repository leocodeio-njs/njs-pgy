import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IntegrationProductEntity } from './products.entity';

@Entity('integration_product_pricing')
export class IntegrationProductPricingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['FREE', 'TRIAL', 'PAID', 'GOODWILL'],
    name: 'tier_type',
  })
  tierType: string;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'valid_from', type: 'date' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  validTo: Date;

  @Column({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => IntegrationProductEntity, (product) => product.pricing)
  @JoinColumn({ name: 'product_id' })
  product: IntegrationProductEntity;
}
