import { Injectable, HttpException } from '@nestjs/common';
import { RazorpayService } from '../../../razorpay.service';
import { VerifyPaymentDto } from '../dtos/verify-payment.dto';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { ConfigService } from '@nestjs/config';
import { VerifySubscriptionPaymentDto } from '../dtos/verify-subscription-dto';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly configService: ConfigService,
  ) {}

  async verifyPayment(paymentData: VerifyPaymentDto) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        paymentData;
      console.log(
        'razorpay_order_id, razorpay_payment_id, razorpay_signature',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      );
      const secret = this.configService.get('RAZORPAY_KEY_SECRET');
      console.log('secret', secret);
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      console.log('body', body);

      const isValid = validateWebhookSignature(
        body,
        razorpay_signature,
        secret,
      );
      console.log('isValid', isValid);
      if (!isValid) {
        throw new HttpException('Invalid signature', 400);
      }
      console.log('Payment verification successful');
      return true;
    } catch (error) {
      throw new HttpException(
        error.message || 'Payment verification failed',
        error.statusCode || 500,
      );
    }
  }

  async verifySubscriptionPayment(paymentData: VerifySubscriptionPaymentDto) {
    try {
      const {
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
      } = paymentData;
      console.log(
        'razorpay_subscription_id, razorpay_payment_id, razorpay_signature',
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
      );
      const secret = this.configService.get('RAZORPAY_KEY_SECRET');
      console.log('secret', secret);

      const generated_signature = createHmac('sha256', secret)
        .update(razorpay_payment_id + '|' + razorpay_subscription_id)
        .digest('hex');
      console.log('generated_signature', generated_signature);
      console.log('razorpay_signature', razorpay_signature);

      if (generated_signature == razorpay_signature) {
        // payment is successful
        console.log('Subscription payment verification successful');
        return true;
      }
      console.log('Subscription payment verification failed');
      throw new HttpException('Invalid signature', 400);
    } catch (error) {
      throw new HttpException(
        error.message || 'Subscription payment verification failed',
        error.statusCode || 500,
      );
    }
  }

  async getPayment(paymentId: string) {
    try {
      return await this.razorpayService.razorpay.payments.fetch(paymentId);
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching payment',
        error.statusCode || 500,
      );
    }
  }
}
