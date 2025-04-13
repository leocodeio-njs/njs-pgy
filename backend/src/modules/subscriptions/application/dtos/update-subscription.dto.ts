import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'The ID of the user creating the subscription',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The ID of the product being subscribed to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  productId: string;

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

  @ApiProperty({
    description: 'The deleted at date',
    example: '2021-01-01',
    required: false,
  })
  @IsDate()
  deletedAt?: Date;

  @ApiProperty({
    description: 'The created at date',
    example: '2021-01-01',
    required: false,
  })
  @IsDate()
  createdAt?: Date;

  @ApiProperty({
    description: 'The updated at date',
    example: '2021-01-01',
    required: false,
  })
  @IsDate()
  updatedAt?: Date;
}
