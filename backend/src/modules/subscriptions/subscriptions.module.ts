import { Module } from '@nestjs/common';
import { SubscriptionsController } from './presentation/controllers/subscriptions.controller';
import { SubscriptionsService } from './application/services/subscriptions.service';
import { RazorpayService } from '../../common/services/razorpay.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, RazorpayService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
