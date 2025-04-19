import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
} from '@nestjs/common';
import { IntegrationSubscriptionsService } from '../../application/services/subscriptions.service';
import { IIntegrationSubscription } from '../../domain/models/subscriptions.model';
import { CreateIntegrationSubscriptionDto } from '../../application/dtos/create-subscription.dto';
import { UpdateIntegrationSubscriptionDto } from '../../application/dtos/update-subscription.dto';

@Controller('subscriptions')
export class IntegrationSubscriptionsController {
  constructor(
    private readonly subscriptionsService: IntegrationSubscriptionsService,
  ) {}

  @Get()
  async findAll(): Promise<IIntegrationSubscription[]> {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IIntegrationSubscription> {
    return this.subscriptionsService.findOne(id);
  }

  @Post()
  async create(
    @Body() subscription: CreateIntegrationSubscriptionDto,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsService.save(subscription);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() subscription: UpdateIntegrationSubscriptionDto,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsService.update(id, subscription);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string): Promise<void> {
    return this.subscriptionsService.cancel(id);
  }

  @Get(':userId/invoices')
  async getInvoices(@Param('userId') userId: string): Promise<any> {
    return this.subscriptionsService.getInvoices(userId);
  }

  @Get('getCurrent/:userId')
  async getCurrent(@Param('userId') userId: string): Promise<string> {
    return this.subscriptionsService.getCurrent(userId);
  }

  @Get('verify/:rzpSubscriptionId')
  async verifySubscription(
    @Param('rzpSubscriptionId') rzpSubscriptionId: string,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsService.verifySubscription(rzpSubscriptionId);
  }

  @Post('cancel')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<void> {
    return this.subscriptionsService.cancel(subscriptionId);
  }
}
