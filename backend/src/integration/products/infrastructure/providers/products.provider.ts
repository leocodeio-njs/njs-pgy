import { Repository } from 'typeorm';
import { IntegrationProductPricing } from '../entities/products-pricing.entity';
import { IntegrationProduct } from '../entities/products.entity';
import { IntegrationSubscriptionTerms } from '../entities/subscription-terms.entity';
import { IntegrationProductAuditEntity } from '../entities/products-log.entity';

export const productsProvider = [
  {
    provide: 'IntegrationProductRepository',
    useClass: Repository<IntegrationProduct>,
  },
  {
    provide: 'IntegrationProductPricingRepository',
    useClass: Repository<IntegrationProductPricing>,
  },
  {
    provide: 'IntegrationSubscriptionTermsRepository',
    useClass: Repository<IntegrationSubscriptionTerms>,
  },
  {
    provide: 'IntegrationProductAuditRepository',
    useClass: Repository<IntegrationProductAuditEntity>,
  },
];
