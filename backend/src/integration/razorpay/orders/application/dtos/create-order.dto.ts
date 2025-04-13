import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsObject, IsOptional } from 'class-validator';
import { IObject } from '../../../customers/application/interfaces/notes-type.interface';

export class CreateOrderDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'INR' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'order_receipt_123' })
  @IsString()
  receipt: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  notes?: IObject<any>;
}
