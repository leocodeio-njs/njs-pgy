import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscussionController } from './infrastructure/controllers/discussion.controller';
import { DiscussionRepository } from './infrastructure/adapters/discussion.repository';
import { DiscussionEntity } from './infrastructure/entities/discussion.entity';

import { DiscussionService } from './application/services/discussion.service';

import { IDiscussionRepository } from './domain/ports/discussion.repository';
import { AuthModule } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';

@Module({
  imports: [TypeOrmModule.forFeature([DiscussionEntity]), AuthModule],
  controllers: [DiscussionController],
  providers: [
    DiscussionService,
    {
      provide: IDiscussionRepository,
      useClass: DiscussionRepository,
    },
  ],
})
export class DiscussionModule {}
