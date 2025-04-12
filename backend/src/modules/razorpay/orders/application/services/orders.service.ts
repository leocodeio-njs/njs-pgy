import { Injectable, HttpException } from '@nestjs/common';
import { RazorpayService } from '../../../../../common/services/razorpay.service';
import { CreateOrderDto } from '../dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly razorpayService: RazorpayService) {}

  async createOrder(orderData: CreateOrderDto) {
    try {
      const options = {
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        notes: orderData.notes,
      };

      const order = await this.razorpayService.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error creating order',
        error.statusCode || 500,
      );
    }
  }

  async getOrder(orderId: string) {
    try {
      return await this.razorpayService.razorpay.orders.fetch(orderId);
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching order',
        error.statusCode || 500,
      );
    }
  }
}
