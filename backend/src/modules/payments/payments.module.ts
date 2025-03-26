import { Module } from '@nestjs/common';
import { PaymentsController } from './presentation/controllers/payments.controller';
import { PaymentsService } from './application/services/payments.service';
import { RazorpayService } from '../../common/services/razorpay.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@leocodeio-njs/njs-auth';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
