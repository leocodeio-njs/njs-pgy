import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  discussionId: string;

  @Column('jsonb')
  sender: {
    id: string;
    name: string;
  };

  @Column('jsonb')
  messageContent: {
    type: 'text' | 'image' | 'video';
    content: string;
  }[];

  @Column({ type: 'varchar' })
  time: string;

  @Column({ type: 'varchar' })
  date: string;

  @Column('jsonb', { nullable: true })
  share: {
    twit: string;
  };

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
