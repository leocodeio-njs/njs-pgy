import { Repository } from 'typeorm';
import { IntegrationUser } from '../entities/users.entity';
import { IntegrationUserAuditLog } from '../entities/users-log.entity';
import { DataSource } from 'typeorm';
export const usersProvider = [
  {
    provide: 'IntegrationUserRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationUser),
    inject: [DataSource],
  },
  {
    provide: 'IntegrationUserAuditLogRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IntegrationUserAuditLog),
    inject: [DataSource],
  },
];
