import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
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
import { CancelSubscriptionDto } from '../../application/dtos/cancel-subscription.dto';
import { UpdateSubscriptionDto } from '../../application/dtos/update-subscription.dto';
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

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
  })
  async cancelSubscription(
    @Param('id') id: string,
    @Body() cancelSubscriptionDto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(
      id,
      cancelSubscriptionDto,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  async updateSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(
      id,
      updateSubscriptionDto,
    );
  }

  @Get(':id/invoices')
  @ApiOperation({ summary: 'Get invoices for a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Returns all invoices for the subscription',
  })
  async getSubscriptionInvoices(@Param('id') id: string) {
    return this.subscriptionsService.getSubscriptionInvoices(id);
  }
}
