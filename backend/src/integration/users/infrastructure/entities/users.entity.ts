import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('integration_users')
export class IntegrationUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  integrationUserId: string;

  @Column()
  customerId: string;
}
