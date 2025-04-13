import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from '../../application/services/orders.service';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';

@ApiTags('Orders')
// @ApiSecurity('x-api-key')
// @ApiBearerAuth()
@Controller('rzp/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}
