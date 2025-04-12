import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';
import { IObject } from '../interfaces/notes-type.interface';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9123456780' })
  @IsString()
  contact: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  fail_existing?: 0 | 1;

  @ApiProperty({ required: false, example: '12ABCDE2356F7GH' })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  notes?: IObject<any>;
}
