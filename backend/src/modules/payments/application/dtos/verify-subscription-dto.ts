import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifySubscriptionPaymentDto {
  @ApiProperty()
  @IsString()
  razorpay_subscription_id: string;

  @ApiProperty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty()
  @IsString()
  razorpay_signature: string;
}
