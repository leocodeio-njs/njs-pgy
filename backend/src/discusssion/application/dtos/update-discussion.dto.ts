import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscussionDto } from './create-discussion.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateDiscussionDto extends PartialType(CreateDiscussionDto) {
  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  participants?: {
    id: string;
    name: string;
  }[];

  @ApiPropertyOptional()
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  updated_at?: string;
}
