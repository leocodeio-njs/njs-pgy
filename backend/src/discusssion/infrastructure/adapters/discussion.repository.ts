import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IDiscussionRepository } from '../../domain/ports/discussion.repository';
import { Discussion } from '../../domain/models/discussion';
import { DiscussionEntity } from '../entities/discussion.entity';

@Injectable()
export class DiscussionRepository implements IDiscussionRepository {
  constructor(
    @InjectRepository(DiscussionEntity)
    private readonly discussionRepository: Repository<DiscussionEntity>,
  ) {}

  async findAll(): Promise<Discussion[]> {
    const entities = await this.discussionRepository.find();
    return entities.map((item) => toDomain(item));
  }

  async findOne(id: string): Promise<Discussion> {
    const entity = await this.discussionRepository.findOne({ where: { id } });
    return toDomain(entity);
  }

  async findByUserId(user_id: string): Promise<Discussion[]> {
    const entities = await this.discussionRepository.find({
      where: { user_id },
    });
    return entities.map((item) => toDomain(item));
  }

  async save(discussion: Discussion): Promise<Discussion> {
    const newEntity = await this.discussionRepository.save(discussion);
    return toDomain(newEntity);
  }

  async delete(id: string): Promise<void> {
    await this.discussionRepository.delete(id);
  }
}

function toDomain(discussionEntity: DiscussionEntity): Discussion {
  return {
    id: discussionEntity.id,
    user_id: discussionEntity.user_id,
    title: discussionEntity.title,
    type: discussionEntity.type,
    isPinned: discussionEntity.isPinned,
    participants: discussionEntity.participants,
    created_at: discussionEntity.created_at,
    updated_at: discussionEntity.updated_at,
  };
}
