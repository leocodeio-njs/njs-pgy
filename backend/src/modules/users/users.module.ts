import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationUsersController } from './presentation/controllers/users.controller';
import { IntegrationUsersService } from './application/services/users.service';
import { IUsersPort } from './domain/ports/users.port';
import { UserRepositoryAdapter } from './infrastructure/adapters/users.adapter';
import { IntegrationUser } from './infrastructure/entities/users.entity';
import { IntegrationUserAuditLog } from './infrastructure/entities/users-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IntegrationUser, IntegrationUserAuditLog]),
  ],
  controllers: [IntegrationUsersController],
  providers: [
    // services
    IntegrationUsersService,
    // providers
    {
      provide: IUsersPort,
      useClass: UserRepositoryAdapter,
    },
  ],
})
export class IntegrationUsersModule {}
