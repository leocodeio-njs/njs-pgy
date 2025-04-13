import { Module } from '@nestjs/common';
import { SubscriptionsController } from './presentation/controllers/subscriptions.controller';
import { SubscriptionsService } from './application/services/subscriptions.service';
import { RazorpayService } from '@/integration/razorpay/razorpay.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@leocodeio-njs/njs-auth';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, RazorpayService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
