import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { IObject } from '../interfaces/notes-type.interface';

export class UpdateCustomerDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9123456780', required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  notes?: IObject<any>;
}
