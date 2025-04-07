import { Injectable, HttpException } from '@nestjs/common';
import { RazorpayService } from '../../../../common/services/razorpay.service';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { CancelSubscriptionDto } from '../dtos/cancel-subscription.dto';
import { UpdateSubscriptionDto } from '../dtos/update-subscription.dto';
@Injectable()
export class SubscriptionsService {
  constructor(private readonly razorpayService: RazorpayService) {}

  async createSubscription(subscriptionData: CreateSubscriptionDto) {
    try {
      const subscription =
        this.razorpayService.razorpay.subscriptions.create(subscriptionData);
      return subscription;
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error creating order',
        error.statusCode || 500,
      );
    }
  }

  async getSubscription(subscriptionId?: string) {
    try {
      if (!subscriptionId) {
        return await this.razorpayService.razorpay.subscriptions.all();
      }
      return await this.razorpayService.razorpay.subscriptions.fetch(
        subscriptionId,
      );
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching subscription',
        error.statusCode || 500,
      );
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelOptions: CancelSubscriptionDto,
  ) {
    try {
      return await this.razorpayService.razorpay.subscriptions.cancel(
        subscriptionId,
        cancelOptions.cancel_at_cycle_end,
      );
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error canceling subscription',
        error.statusCode || 500,
      );
    }
  }

  async updateSubscription(
    subscriptionId: string,
    updateData: UpdateSubscriptionDto,
  ) {
    try {
      return await this.razorpayService.razorpay.subscriptions.update(
        subscriptionId,
        updateData,
      );
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error updating subscription',
        error.statusCode || 500,
      );
    }
  }

  async getSubscriptionInvoices(subscriptionId: string) {
    try {
      return await this.razorpayService.razorpay.invoices.all({
        subscription_id: subscriptionId,
      });
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching subscription invoices',
        error.statusCode || 500,
      );
    }
  }
}
