import { Injectable, HttpException } from '@nestjs/common';
import { RazorpayService } from '../../../razorpay.service';
import { CreatePlanDto } from '../dtos/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly razorpayService: RazorpayService) {}

  async createPlan(planData: CreatePlanDto) {
    try {
      const options = {
        period: planData.period,
        interval: planData.interval,
        item: planData.item,
      };

      const plan = await this.razorpayService.razorpay.plans.create(options);
      return plan;
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error creating plan',
        error.statusCode || 500,
      );
    }
  }

  async getPlan(planId?: string) {
    try {
      if (!planId) {
        return await this.razorpayService.razorpay.plans.all();
      }
      return await this.razorpayService.razorpay.plans.fetch(planId);
    } catch (error) {
      throw new HttpException(
        error.error?.description || 'Error fetching plan',
        error.statusCode || 500,
      );
    }
  }
}
