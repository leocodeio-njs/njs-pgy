import { Module } from '@nestjs/common';
import { IntegrationProductsController } from './presentation/controllers/products.controller';
import { IntegrationProductsService } from './application/services/products.service';

@Module({
  controllers: [IntegrationProductsController],
  providers: [IntegrationProductsService],
})
export class IntegrationProductsModule {}
