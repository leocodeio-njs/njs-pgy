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
}
