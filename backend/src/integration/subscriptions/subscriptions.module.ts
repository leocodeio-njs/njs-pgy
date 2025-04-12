
import { Module } from '@nestjs/common';
import { IntegrationSubscriptionsController } from './presentation/controllers/subscriptions.controller';
import { IntegrationSubscriptionsService } from './application/services/subscriptions.service';

@Module({
  controllers: [IntegrationSubscriptionsController],
  providers: [IntegrationSubscriptionsService],
})
export class IntegrationSubscriptionsModule {}
