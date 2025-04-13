import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationSubscriptionsController } from './presentation/controllers/subscriptions.controller';
import { IntegrationSubscriptionsService } from './application/services/subscriptions.service';
import { ISubscriptionsPort } from './domain/ports/subscriptions.port';
import { SubscriptionRepositoryAdapter } from './infrastructure/adapters/subscriptions.adapter';
import { IntegrationSubscription } from './infrastructure/entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from './infrastructure/entities/subscriptions-log.entity';
import { subscriptionsProvider } from './infrastructure/providers/subscriptions.provider';
import { IntegrationProductsService } from '../products/application/services/products.service';
import { SubscriptionsService } from '@/integration/razorpay/subscriptions/application/services/subscriptions.service';
import { IProductsPort } from '../products/domain/ports/products.port';
import { ProductRepositoryAdapter } from '../products/infrastructure/adapters/products.adapter';
import { RazorpayService } from '@/integration/razorpay/razorpay.service';
import { productsProvider } from '../products/infrastructure/providers/products.provider';
import { PlansService } from '@/integration/razorpay/plans/application/services/plans.service';
import { IntegrationUsersService } from '../users/application/services/users.service';
import { CustomersService } from '@/integration/razorpay/customers/application/services/customers.service';
import { IUsersPort } from '../users/domain/ports/users.port';
import { UserRepositoryAdapter } from '../users/infrastructure/adapters/users.adapter';
import { usersProvider } from '../users/infrastructure/providers/users.provider';

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
    IntegrationProductsService,
    SubscriptionsService,
    PlansService,
    RazorpayService,
    IntegrationUsersService,
    CustomersService,
    // providers
    {
      provide: ISubscriptionsPort,
      useClass: SubscriptionRepositoryAdapter,
    },

    {
      provide: IProductsPort,
      useClass: ProductRepositoryAdapter,
    },
    {
      provide: IUsersPort,
      useClass: UserRepositoryAdapter,
    },
    ...usersProvider,
    ...productsProvider,
    ...subscriptionsProvider,
  ],
})
export class IntegrationSubscriptionsModule {}
