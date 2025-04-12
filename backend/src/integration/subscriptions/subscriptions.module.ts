import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationSubscriptionsController } from './presentation/controllers/subscriptions.controller';
import { IntegrationSubscriptionsService } from './application/services/subscriptions.service';
import { ISubscriptionsPort } from './domain/ports/subscriptions.port';
import { SubscriptionRepositoryAdapter } from './infrastructure/adapters/subscriptions.adapter';
import { IntegrationSubscription } from './infrastructure/entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from './infrastructure/entities/subscriptions-log.entity';
import { subscriptionsProvider } from './infrastructure/providers/subscriptions.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IntegrationSubscription,
      IntegrationSubscriptionAuditLog,
    ]),
  ],
  controllers: [IntegrationSubscriptionsController],
  providers: [
    // services
    IntegrationSubscriptionsService,
    // providers
    {
      provide: ISubscriptionsPort,
      useClass: SubscriptionRepositoryAdapter,
    },
    ...subscriptionsProvider,
  ],
})
export class IntegrationSubscriptionsModule {}
