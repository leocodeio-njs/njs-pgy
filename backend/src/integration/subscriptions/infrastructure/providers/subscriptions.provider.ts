import { Repository } from 'typeorm';
import { IntegrationSubscription } from '../entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from '../entities/subscriptions-log.entity';

export const subscriptionsProvider = [
  {
    provide: 'IntegrationSubscriptionRepository',
    useClass: Repository<IntegrationSubscription>,
  },
  {
    provide: 'IntegrationSubscriptionAuditLogRepository',
    useClass: Repository<IntegrationSubscriptionAuditLog>,
  },
];
