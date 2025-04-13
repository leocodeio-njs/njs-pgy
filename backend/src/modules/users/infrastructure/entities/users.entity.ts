import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('integration_users')
export class IntegrationUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column()
  integrationUserId: string;

  @Column()
  customerId: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date | null;
}
