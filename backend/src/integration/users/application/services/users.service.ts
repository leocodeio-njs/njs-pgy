import { Injectable } from '@nestjs/common';
import { IUsersPort } from '../../domain/ports/users.port';
import { IntegrationUser } from '../../infrastructure/entities/users.entity';
import { IIntegrationUser } from '../../domain/models/users.model';

@Injectable()
export class IntegrationUsersService {
  constructor(private readonly usersPort: IUsersPort) {}

  async findAll(): Promise<IIntegrationUser[]> {
    return this.usersPort.findAll();
  }

  async findOne(id: string): Promise<IIntegrationUser> {
    return this.usersPort.findOne(id);
  }

  async findByCustomerId(customerId: string): Promise<IIntegrationUser[]> {
    return this.usersPort.findByCustomerId(customerId);
  }

  async findByIntegrationUserId(
    integrationUserId: string,
  ): Promise<IIntegrationUser[]> {
    return this.usersPort.findByIntegrationUserId(integrationUserId);
  }

  async save(user: IIntegrationUser): Promise<IIntegrationUser> {
    return this.usersPort.save(user);
  }

  async delete(id: string): Promise<void> {
    return this.usersPort.delete(id);
  }

  async update(id: string, user: IIntegrationUser): Promise<void> {
    return this.usersPort.update(id, user);
  }
}
