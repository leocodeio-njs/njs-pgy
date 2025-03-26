import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from '../entities/message.entity';
import { IMessageRepository } from '../../domain/ports/message.repository';
import { Message } from '../../domain/models/message';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findAll(): Promise<Message[]> {
    const entities = await this.messageRepository.find();
    return entities.map((item) => toDomain(item));
  }

  async findOne(id: string): Promise<Message> {
    const entity = await this.messageRepository.findOne({ where: { id } });
    return toDomain(entity);
  }

  async findByDiscussionId(discussion_id: string): Promise<Message[]> {
    const entities = await this.messageRepository.find({
      where: { discussionId: discussion_id },
    });
    return entities.map((item) => toDomain(item));
  }

  async save(message: Message): Promise<Message> {
    const newEntity = await this.messageRepository.save(message);
    return toDomain(newEntity);
  }

  async delete(id: string): Promise<void> {
    await this.messageRepository.delete(id);
  }
}

function toDomain(messageEntity: MessageEntity): Message {
  return {
    id: messageEntity.id,
    discussionId: messageEntity.discussionId,
    sender: messageEntity.sender,
    messageContent: messageEntity.messageContent,
    time: messageEntity.time,
    date: messageEntity.date,
    share: messageEntity.share,
    created_at: messageEntity.created_at,
    updated_at: messageEntity.updated_at,
  };
}
