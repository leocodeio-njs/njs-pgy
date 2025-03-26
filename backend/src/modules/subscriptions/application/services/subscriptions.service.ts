import { Injectable, HttpException } from '@nestjs/common';
import { RazorpayService } from '../../../../common/services/razorpay.service';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly razorpayService: RazorpayService) {}

  async createSubscription(subscriptionData: CreateSubscriptionDto) {
    try {
      const subscription = this.razorpayService.razorpay.subscriptions.create(subscriptionData);
      return subscription;
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error creating order',
        error.statusCode || 500,
      );
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await this.razorpayService.razorpay.subscriptions.fetch(subscriptionId);
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching subscription',
        error.statusCode || 500,
      );
    }
  }
}
