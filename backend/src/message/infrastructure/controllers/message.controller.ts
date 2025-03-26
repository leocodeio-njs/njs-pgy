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
import { MessageService } from '../../application/services/message.service';
import { CreateMessageDto } from '../../application/dtos/create-message.dto';
import { UpdateMessageDto } from '../../application/dtos/update-message.dto';
import {
  AccessTokenAuthGuard,
  ApiKeyGuard,
} from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import {
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggingInterceptor } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';

@ApiTags('Messages')
@UseInterceptors(LoggingInterceptor)
@Controller({
  path: 'message',
})
@UseGuards(ApiKeyGuard, AccessTokenAuthGuard)
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiResponse({ status: 200, description: 'Message found successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all messages successfully',
  })
  findAll() {
    return this.messageService.findAll();
  }

  @Get('discussion/:discussion_id')
  @ApiOperation({ summary: 'Get all messages for a specific discussion' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved discussion messages successfully',
  })
  @ApiResponse({ status: 404, description: 'Discussion not found' })
  findAllByDiscussionId(@Param('discussion_id') discussion_id: string) {
    return this.messageService.findAllByDiscussionId(discussion_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid message data' })
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing message' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 400, description: 'Invalid message data' })
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
