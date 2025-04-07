import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsObject, IsOptional } from 'class-validator';
import { IObject } from '../../../customers/application/interfaces/notes-type.interface';
import { CreateItemDto } from './create-item.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @ApiProperty({ example: 'Yellow Herb' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Yellow herb from Resident Evil' })
  @IsString()
  description: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
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
