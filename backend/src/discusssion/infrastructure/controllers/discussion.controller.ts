import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { DiscussionService } from '../../application/services/discussion.service';
import { CreateDiscussionDto } from '../../application/dtos/create-discussion.dto';
import { UpdateDiscussionDto } from '../../application/dtos/update-discussion.dto';
import { ConfigService } from '@nestjs/config';
import {
  ApiKeyGuard,
  AccessTokenAuthGuard,
} from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import {
  ApiSecurity,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoggingInterceptor } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';

const configService = new ConfigService();
@UseInterceptors(LoggingInterceptor)
@Controller({
  path: 'discussion',
})
@UseGuards(ApiKeyGuard, AccessTokenAuthGuard)
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@ApiTags('Discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discussion' })
  @ApiResponse({ status: 201, description: 'Discussion created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid discussion data' })
  create(@Body() createDiscussionDto: CreateDiscussionDto) {
    return this.discussionService.create(createDiscussionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a discussion by ID' })
  @ApiResponse({ status: 200, description: 'Discussion found successfully' })
  @ApiResponse({ status: 404, description: 'Discussion not found' })
  findOne(@Param('id') id: string) {
    return this.discussionService.findOne(id);
  }

  @Get('user/:user_id')
  @ApiOperation({ summary: 'Get all discussions for a user' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user discussions successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUserId(@Param('user_id') user_id: string) {
    return this.discussionService.findByUserId(user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing discussion' })
  @ApiResponse({ status: 200, description: 'Discussion updated successfully' })
  @ApiResponse({ status: 404, description: 'Discussion not found' })
  @ApiResponse({ status: 400, description: 'Invalid discussion data' })
  update(
    @Param('id') id: string,
    @Body() updateDiscussionDto: UpdateDiscussionDto,
  ) {
    return this.discussionService.update(id, updateDiscussionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discussion' })
  @ApiResponse({ status: 200, description: 'Discussion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Discussion not found' })
  remove(@Param('id') id: string) {
    return this.discussionService.remove(id);
  }
}
