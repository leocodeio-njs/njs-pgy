import { Module } from '@nestjs/common';
import { IntegrationProductsController } from './presentation/controllers/products.controller';
import { IntegrationProductsService } from './application/services/products.service';
import { IProductsPort } from './domain/ports/products.port';
import { ProductRepositoryAdapter } from './infrastructure/adapters/products.adapter';
import { productsProvider } from './infrastructure/providers/products.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationProduct } from './infrastructure/entities/products.entity';
import { IntegrationProductAuditLogEntity } from './infrastructure/entities/products-log.entity';
import { RazorpayService } from '@/common/services/razorpay.service';
import { PlansService } from '@/modules/razorpay/plans/application/services/plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IntegrationProduct,
      IntegrationProductAuditLogEntity,
    ]),
  ],
  controllers: [IntegrationProductsController],
  providers: [
    // services
    IntegrationProductsService,
    RazorpayService,
    PlansService,
    // providers
    {
      provide: IProductsPort,
      useClass: ProductRepositoryAdapter,
    },
    ...productsProvider,
  ],
})
export class IntegrationProductsModule {}
