import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionsService } from '../../application/services/subscriptions.service';
import { CreateSubscriptionDto } from '../../application/dtos/create-subscription.dto';
import { AccessTokenAuthGuard, ApiKeyGuard } from '@leocodeio-njs/njs-auth';
@ApiTags('Subscriptions')
// @ApiSecurity('x-api-key')
// @ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({ status: 200, description: 'Returns all subscriptions' })
  async getAllSubscriptions() {
    return this.subscriptionsService.getSubscription();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Returns subscription details' })
  async getSubscription(@Param('id') id: string) {
    return this.subscriptionsService.getSubscription(id);
  }
}
