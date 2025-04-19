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
  abstract getInvoices(userId: string): Promise<any>;
  abstract getCurrent(userId: string): Promise<string>;
  abstract verifySubscription(
    rzpSubscriptionId: string,
  ): Promise<IIntegrationSubscription>;
  // [TODO] work on offers
}
