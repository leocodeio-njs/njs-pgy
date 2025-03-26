import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { UpdateMessageDto } from '../dtos/update-message.dto';
import { MessageRepository } from '../../infrastructure/adapters/message.repository';
import { IMessageRepository } from '../../domain/ports/message.repository';
import { Message } from '../../domain/models/message';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      return await this.messageRepository.save({
        id: null,
        discussionId: createMessageDto.discussionId,
        sender: createMessageDto.sender,
        messageContent: createMessageDto.messageContent,
        time: createMessageDto.time,
        date: createMessageDto.date,
        share: createMessageDto.share,
        created_at: createMessageDto.created_at,
        updated_at: createMessageDto.updated_at,
      });
    } catch (error) {
      console.error('Message creation error:', {
        dto: createMessageDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAll(): Promise<Message[]> {
    try {
      return await this.messageRepository.findAll();
    } catch (error) {
      console.error('Find all messages error:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findOne(id: string): Promise<Message> {
    try {
      if (!id) {
        throw new NotFoundException('Message ID is required');
      }
      const message = await this.messageRepository.findOne(id);
      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      return message;
    } catch (error) {
      console.error('Find message error:', {
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAllByDiscussionId(discussion_id: string): Promise<any> {
    return this.messageRepository.findByDiscussionId(discussion_id);
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    try {
      const message = await this.findOne(id); // Reuse findOne method for consistency
      return await this.messageRepository.save({
        id: message.id,
        discussionId: message.discussionId,
        sender: message.sender,
        messageContent: message.messageContent,
        time: message.time,
        date: message.date,
        share: message.share,
        created_at: message.created_at,
        updated_at: message.updated_at,
      });
    } catch (error) {
      console.error('Update message error:', {
        id,
        dto: updateMessageDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.findOne(id); // Reuse findOne method for consistency
      await this.messageRepository.delete(id);
      return {
        message: 'Message deleted successfully',
      };
    } catch (error) {
      console.error('Delete message error:', {
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
