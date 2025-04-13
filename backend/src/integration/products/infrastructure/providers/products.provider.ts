import { Repository } from 'typeorm';
import { IntegrationProductPricing } from '../entities/products-pricing.entity';
import { IntegrationProduct } from '../entities/products.entity';
import { IntegrationSubscriptionTerms } from '../entities/subscription-terms.entity';
import { IntegrationProductAuditLogEntity } from '../entities/products-log.entity';
import { DataSource } from 'typeorm';
export const productsProvider = [
  {
    provide: 'IntegrationProductRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationProduct),
    inject: [DataSource],
  },
  {
    provide: 'IntegrationProductPricingRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationProductPricing),
    inject: [DataSource],
  },
  {
    provide: 'IntegrationSubscriptionTermsRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationSubscriptionTerms),
    inject: [DataSource],
  },
  {
    provide: 'IntegrationProductAuditLogEntityRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationProductAuditLogEntity),
    inject: [DataSource],
  },
];
