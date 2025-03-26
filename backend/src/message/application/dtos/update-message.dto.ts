import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { IsArray, IsDate, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  messageContent?: {
    type: 'text' | 'image' | 'video';
    content: string;
  }[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  sender?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  share?: {
    twit: string;
  };

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @IsNotEmpty()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @IsNotEmpty()
  updated_at: Date;
}
