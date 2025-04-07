import { Module } from '@nestjs/common';
import { ItemsController } from './presentation/controllers/items.controller';
import { ItemsService } from './application/services/items.service';
import { RazorpayService } from '../../common/services/razorpay.service';
import { AuthModule } from '@leocodeio-njs/njs-auth';

@Module({
  imports: [AuthModule],
  controllers: [ItemsController],
  providers: [ItemsService, RazorpayService],
  exports: [ItemsService],
})
export class ItemsModule {}
