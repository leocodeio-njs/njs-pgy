import { IIntegrationUser } from '../models/users.model';

export abstract class IUsersPort {
  abstract findAll(): Promise<IIntegrationUser[]>;
  abstract findOne(id: string): Promise<IIntegrationUser>;
  abstract findByCustomerId(customerId: string): Promise<IIntegrationUser[]>;
  abstract findByIntegrationUserId(
    integrationUserId: string,
  ): Promise<IIntegrationUser[]>;
  abstract save(user: IIntegrationUser): Promise<IIntegrationUser>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, user: IIntegrationUser): Promise<void>;
}
