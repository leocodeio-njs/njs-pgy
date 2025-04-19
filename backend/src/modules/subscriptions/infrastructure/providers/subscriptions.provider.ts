import { DataSource } from 'typeorm';
import { IntegrationSubscription } from '../entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from '../entities/subscriptions-log.entity';
import { IntegrationInvoice } from '../entities/invoices.entity';

export const subscriptionsProvider = [
  {
    provide: 'IntegrationSubscriptionRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationSubscription),
    inject: [DataSource],
  },
  {
    provide: 'IntegrationSubscriptionAuditLogRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationSubscriptionAuditLog),
    inject: [DataSource],
  },
  {
    provide: 'IntegrationInvoiceRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationInvoice),
    inject: [DataSource],
  },
];
