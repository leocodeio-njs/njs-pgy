import { IIntegrationUser } from '../models/users.model';

export interface IUsersRepository {
  findAll(): Promise<IIntegrationUser[]>;
  findOne(id: string): Promise<IIntegrationUser>;
  findByCustomerId(customerId: string): Promise<IIntegrationUser[]>;
  findByIntegrationUserId(integrationUserId: string): Promise<IIntegrationUser[]>;
  save(user: IIntegrationUser): Promise<IIntegrationUser>;
  delete(id: string): Promise<void>;
  update(id: string, user: IIntegrationUser): Promise<void>;
}
