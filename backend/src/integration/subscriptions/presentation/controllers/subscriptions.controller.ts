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
import { CreateSubscriptionDto } from '../../application/dtos/create-subscription.dto';

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
    @Body() subscription: CreateSubscriptionDto,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsService.save(subscription);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsService.update(id, subscription);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string): Promise<void> {
    return this.subscriptionsService.cancel(id);
  }

  @Get(':id/invoices')
  async getInvoices(@Param('id') id: string): Promise<any> {
    return this.subscriptionsService.getInvoices(id);
  }
}
