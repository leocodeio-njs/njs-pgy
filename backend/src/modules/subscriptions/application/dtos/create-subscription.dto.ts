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

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 1893456000 })
  @IsNumber()
  start_at: number;

  @ApiProperty({ example: 1893457000 })
  @IsNumber()
  expire_by: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  customer_notify: boolean | 1 | 0;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  notes?: IObject<any>;
}
