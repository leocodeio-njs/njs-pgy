import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsObject, IsOptional } from 'class-validator';
import { IObject } from '../../../customers/application/interfaces/notes-type.interface';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'plan_PjffELs29zzFeI' })
  @IsString()
  plan_id: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  total_count: number;

  @ApiProperty({ example: 'cust_QFQJWwHlLudxtF' })
  @IsString()
  customer_id: string;
}
