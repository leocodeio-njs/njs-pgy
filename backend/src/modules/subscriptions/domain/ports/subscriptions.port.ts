import { IIntegrationSubscription } from '../models/subscriptions.model';

export abstract class ISubscriptionsPort {
  abstract findAll(): Promise<IIntegrationSubscription[]>;
  abstract findOne(id: string): Promise<IIntegrationSubscription>;
  abstract save(
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription>;
  abstract update(
    id: string,
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription>;
  abstract cancel(id: string): Promise<void>;
  abstract getInvoices(id: string): Promise<any>;
  // [TODO] work on offers
}
