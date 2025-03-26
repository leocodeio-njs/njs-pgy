import { Module } from '@nestjs/common';
import { CustomersController } from './presentation/controllers/customers.controller';
import { CustomersService } from './application/services/customers.service';
import { RazorpayService } from '../../common/services/razorpay.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@leocodeio-njs/njs-auth';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, RazorpayService],
  exports: [CustomersService],
})
export class CustomersModule {}
