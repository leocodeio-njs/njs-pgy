import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Yellow Herb' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Yellow herb from Resident Evil' })
  @IsString()
  description: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'INR' })
  @IsString()
  currency: string;
}
