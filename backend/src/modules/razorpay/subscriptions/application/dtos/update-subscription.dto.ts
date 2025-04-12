import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum ScheduleChangeAt {
  NOW = 'now',
  CYCLE_END = 'cycle_end',
}

export class UpdateSubscriptionDto {
  @ApiProperty({ example: 'plan_PjffELs29zzFeI', required: false })
  @IsOptional()
  @IsString()
  plan_id?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ example: 6, required: false })
  @IsOptional()
  @IsNumber()
  remaining_count?: number;

  @ApiProperty({
    example: 'now',
    enum: ScheduleChangeAt,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScheduleChangeAt)
  schedule_change_at?: ScheduleChangeAt;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsBoolean()
  customer_notify?: boolean;

  @ApiProperty({ example: 'offer_PjffELs29zzFeI', required: false })
  @IsOptional()
  @IsString()
  offer_id?: string;
}
