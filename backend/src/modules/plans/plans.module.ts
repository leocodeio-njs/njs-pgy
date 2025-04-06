import { Module } from '@nestjs/common';
import { PlansController } from './presentation/controllers/plans.controller';
import { PlansService } from './application/services/plans.service';
import { RazorpayService } from '../../common/services/razorpay.service';
import { AuthModule } from '@leocodeio-njs/njs-auth';

@Module({
  imports: [AuthModule],
  controllers: [PlansController],
  providers: [PlansService, RazorpayService],
  exports: [PlansService],
})
export class PlansModule {}
