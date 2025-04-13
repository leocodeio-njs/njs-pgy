import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsInt } from 'class-validator';
import { Item } from '@/integration/razorpay/items/application/types/item.types';
import { PlanPeriod } from '@/integration/razorpay/plans/application/types/plan.types';

export class CreatePlanDto {
  @ApiProperty({ example: 'monthly' })
  @IsEnum(PlanPeriod)
  period: PlanPeriod;

  @ApiProperty({ example: 1 })
  @IsInt()
  interval: number;

  @ApiProperty({
    example: {
      name: 'item_123',
      description: 'item_123',
      amount: 29900,
      currency: 'INR',
    },
  })
  @IsObject()
  item: Item;
}
