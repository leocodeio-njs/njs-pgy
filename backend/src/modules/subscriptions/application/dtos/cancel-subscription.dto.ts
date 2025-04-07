import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({ example: 0, description: 'Cancel at cycle end (0: immediately, 1: at end of cycle)' })
  @IsNumber()
  @IsOptional()
  cancel_at_cycle_end?: number;
}