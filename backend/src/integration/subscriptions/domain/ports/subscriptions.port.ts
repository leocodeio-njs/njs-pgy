import { IIntegrationSubscription } from '../models/subscriptions.model';

export interface ISubscriptionsRepository {
  findAll(): Promise<IIntegrationSubscription[]>;
  findOne(id: string): Promise<IIntegrationSubscription>;
  save(
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription>;
  update(id: string, subscription: IIntegrationSubscription): Promise<void>;
  cancel(id: string): Promise<void>;
  getInvoices(id: string): Promise<any>;
  // [TODO] work on offers
}
