import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageController } from './infrastructure/controllers/message.controller';
import { MessageRepository } from './infrastructure/adapters/message.repository';
import { MessageEntity } from './infrastructure/entities/message.entity';

import { MessageService } from './application/services/message.service';

import { IMessageRepository } from './domain/ports/message.repository';
import { AuthModule } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity]), AuthModule],
  controllers: [MessageController],
  providers: [
    MessageService,
    {
      provide: IMessageRepository,
      useClass: MessageRepository,
    },
  ],
})
export class MessageModule {}
