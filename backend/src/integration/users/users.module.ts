import { Module } from '@nestjs/common';
import { IntegrationUsersController } from './presentation/controllers/users.controller';
import { IntegrationUsersService } from './application/services/users.service';

@Module({
  controllers: [IntegrationUsersController],
  providers: [IntegrationUsersService],
})
export class IntegrationUsersModule {}
