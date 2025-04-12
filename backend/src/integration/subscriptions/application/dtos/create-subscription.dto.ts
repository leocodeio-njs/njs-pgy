import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'The ID of the user creating the subscription',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'The ID of the product being subscribed to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'The ID of the product being subscribed to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  integrationProductId: string;

  @ApiProperty({
    description: 'The status of the subscription',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'The Pgy subscription ID',
    example: 'pgy_sub_123',
    required: false,
  })
  @IsString()
  @IsOptional()
  pgySubscriptionId?: string;
}
