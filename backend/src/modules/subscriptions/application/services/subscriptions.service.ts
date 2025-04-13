import { Injectable } from '@nestjs/common';
import { ISubscriptionsPort } from '../../domain/ports/subscriptions.port';
import { IIntegrationSubscription } from '../../domain/models/subscriptions.model';

@Injectable()
export class IntegrationSubscriptionsService implements ISubscriptionsPort {
  constructor(private readonly subscriptionsPort: ISubscriptionsPort) {}

  async findAll(): Promise<IIntegrationSubscription[]> {
    return this.subscriptionsPort.findAll();
  }

  async findOne(id: string): Promise<IIntegrationSubscription> {
    return this.subscriptionsPort.findOne(id);
  }

  async save(
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsPort.save(subscription);
  }

  async update(
    id: string,
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription> {
    return this.subscriptionsPort.update(id, subscription);
  }

  async cancel(id: string): Promise<void> {
    return this.subscriptionsPort.cancel(id);
  }

  async getInvoices(id: string): Promise<any> {
    return this.subscriptionsPort.getInvoices(id);
  }
}
