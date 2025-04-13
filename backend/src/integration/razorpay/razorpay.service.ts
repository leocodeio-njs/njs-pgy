import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RazorpayService {
  public razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }
}
