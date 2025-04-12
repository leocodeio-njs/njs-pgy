import { Module } from '@nestjs/common';
import { IntegrationProductsController } from './presentation/controllers/products.controller';
import { IntegrationProductsService } from './application/services/products.service';
import { IProductsPort } from './domain/ports/products.port';
import { ProductRepositoryAdapter } from './infrastructure/adapters/products.adapter';
import { productsProvider } from './infrastructure/providers/products.provider';
@Module({
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
