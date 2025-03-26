import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';;

export class CreateDiscussionDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  user_id: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsArray()
  participants: {
    id: string;
    name: string;
  }[];

  @ApiProperty()
  @IsBoolean()
  isPinned: boolean;

  @ApiProperty()
  @IsString()
  created_at: string;

  @ApiProperty()
  @IsString()
  updated_at: string;
}
