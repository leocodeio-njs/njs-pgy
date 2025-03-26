import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  discussionId: string;

  @ApiProperty()
  @IsObject()
  sender: {
    id: string;
    name: string;
  };

  @ApiProperty()
  @IsArray()
  messageContent: {
    type: 'text' | 'image' | 'video';
    content: string;
  }[];

  @ApiProperty()
  @IsString()
  time: string;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsObject()
  share: {
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
