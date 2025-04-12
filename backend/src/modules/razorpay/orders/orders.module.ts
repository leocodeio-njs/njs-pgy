import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/controllers/orders.controller';
import { OrdersService } from './application/services/orders.service';
import { RazorpayService } from '../../../common/services/razorpay.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@leocodeio-njs/njs-auth';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, RazorpayService],
  exports: [OrdersService],
})
export class OrdersModule {}
