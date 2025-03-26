import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IDiscussionRepository } from '../../domain/ports/discussion.repository';
import { CreateDiscussionDto } from '../dtos/create-discussion.dto';
import { Discussion } from '../../domain/models/discussion';
import { UpdateDiscussionDto } from '../dtos/update-discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly discussionRepository: IDiscussionRepository,
  ) {}

  async create(createDiscussionDto: CreateDiscussionDto): Promise<Discussion> {
    try {
      return await this.discussionRepository.save({
        id: null,
        user_id: createDiscussionDto.user_id,
        title: createDiscussionDto.title,
        type: createDiscussionDto.type,
        isPinned: createDiscussionDto.isPinned,
        participants: createDiscussionDto.participants,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('Discussion creation error:', {
        dto: createDiscussionDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAll(): Promise<any> {
    const discussions = await this.discussionRepository.findAll();
    return discussions;
  }

  async findOne(id: string): Promise<Discussion> {
    try {
      if (!id) {
        throw new NotFoundException('Discussion ID is required');
      }
      const discussion = await this.discussionRepository.findOne(id);
      if (!discussion) {
        throw new NotFoundException(`Discussion with ID ${id} not found`);
      }
      return discussion;
    } catch (error) {
      console.error('Find discussion error:', {
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findByUserId(user_id: string): Promise<Discussion[]> {
    try {
      return await this.discussionRepository.findByUserId(user_id);
    } catch (error) {
      console.error('Find discussions by user error:', {
        user_id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async update(
    id: string,
    updateDiscussionDto: UpdateDiscussionDto,
  ): Promise<Discussion> {
    try {
      const discussion = await this.findOne(id);
      return await this.discussionRepository.save({
        id: discussion.id,
        user_id: discussion.user_id,
        title: discussion.title,
        type: updateDiscussionDto.type,
        isPinned: updateDiscussionDto.isPinned,
        participants: updateDiscussionDto.participants,
        created_at: discussion.created_at,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('Update discussion error:', {
        id,
        dto: updateDiscussionDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      await this.discussionRepository.delete(id);
      return {
        message: 'Discussion deleted successfully',
      };
    } catch (error) {
      console.error('Delete discussion error:', {
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
