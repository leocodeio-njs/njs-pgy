import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ItemsService } from '../../application/services/items.service';
import { CreateItemDto } from '../../application/dtos/create-item.dto';
import { UpdateItemDto } from '../../application/dtos/update-item.dto';

@ApiTags('Items')
@ApiSecurity('x-api-key')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // create item
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createItem(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.createItem(createItemDto);
  }

  // get item by id
  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Returns item details' })
  async getItem(@Param('id') id: string) {
    return this.itemsService.getItem(id);
  }

  // update item
  @Put(':id')
  @ApiOperation({ summary: 'Update item by ID' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, updateItemDto);
  }

  // delete item
  @Delete(':id')
  @ApiOperation({ summary: 'Delete item by ID' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  async deleteItem(@Param('id') id: string) {
    return this.itemsService.deleteItem(id);
  }
}
