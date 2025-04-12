import { Module } from '@nestjs/common';
import { IntegrationProductsController } from './presentation/controllers/products.controller';
import { IntegrationProductsService } from './application/services/products.service';
import { IProductsPort } from './domain/ports/products.port';
import { ProductRepositoryAdapter } from './infrastructure/adapters/products.adapter';
import { productsProvider } from './infrastructure/providers/products.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationProduct } from './infrastructure/entities/products.entity';
import { IntegrationProductAuditLogEntity } from './infrastructure/entities/products-log.entity';
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
    // providers
    {
      provide: IProductsPort,
      useClass: ProductRepositoryAdapter,
    },
    ...productsProvider,
  ],
})
export class IntegrationProductsModule {}
