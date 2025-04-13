import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationUser } from './users.entity';

@Entity('integration_user_audit_log')
export class IntegrationUserAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

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

  @ManyToOne(() => IntegrationUser)
  @JoinColumn({ name: 'user_id' })
  user: IntegrationUser;
}
