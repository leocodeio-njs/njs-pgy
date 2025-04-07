import { Injectable, HttpException } from '@nestjs/common';
import { RazorpayService } from '../../../../common/services/razorpay.service';
import { CreateItemDto } from '../dtos/create-item.dto';
import { UpdateItemDto } from '../dtos/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly razorpayService: RazorpayService) {}

  async createItem(itemData: CreateItemDto) {
    try {
      const options = {
        name: itemData.name,
        amount: itemData.amount,
        currency: itemData.currency,
      };

      const item = await this.razorpayService.razorpay.items.create(options);
      return item;
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error creating order',
        error.statusCode || 500,
      );
    }
  }

  async getItem(itemId: string) {
    try {
      if (!itemId) {
        return await this.razorpayService.razorpay.items.all();
      }
      return await this.razorpayService.razorpay.items.fetch(itemId);
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching item',
        error.statusCode || 500,
      );
    }
  }

  async updateItem(itemId: string, itemData: UpdateItemDto) {
    try {
      return await this.razorpayService.razorpay.items.edit(itemId, {
        name: itemData.name,
        description: itemData.description,
        amount: itemData.amount,
        currency: itemData.currency,
      });
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error updating item',
        error.statusCode || 500,
      );
    }
  }

  async deleteItem(itemId: string) {
    try {
      return await this.razorpayService.razorpay.items.delete(itemId);
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error deleting item',
        error.statusCode || 500,
      );
    }
  }
}
