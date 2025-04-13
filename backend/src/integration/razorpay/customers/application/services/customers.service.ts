import { HttpException, Injectable } from '@nestjs/common';
import { RazorpayService } from '../../../razorpay.service';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly razorpayService: RazorpayService) {}

  async createCustomer(customerData: CreateCustomerDto) {
    console.log(
      '[CustomersService] Attempting to create customer with data:',
      customerData,
    );
    try {
      console.log('[CustomersService] Calling Razorpay API...');
      const customer =
        await this.razorpayService.razorpay.customers.create(customerData);
      console.log(
        '[CustomersService] Razorpay customer created successfully:',
        customer,
      );
      return customer;
    } catch (error) {
      console.error('[CustomersService] Error in Razorpay customer creation:', {
        error: error.error,
        statusCode: error.statusCode,
        message: error.error.description,
      });
      return new HttpException(error.error.description, error.statusCode);
    }
  }

  async getCustomers(customerId?: string) {
    try {
      if (!customerId) {
        return await this.razorpayService.razorpay.customers.all();
      }
      const customer =
        await this.razorpayService.razorpay.customers.fetch(customerId);
      return customer;
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(customerId: string, customerData: UpdateCustomerDto) {
    try {
      const customer = await this.razorpayService.razorpay.customers.edit(
        customerId,
        customerData,
      );
      return customer;
    } catch (error) {
      throw error;
    }
  }
}
