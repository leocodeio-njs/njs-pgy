import { Repository } from 'typeorm';
import { IntegrationUser } from '../entities/users.entity';
import { IntegrationUserAuditLog } from '../entities/users-log.entity';

export const usersProvider = [
  {
    provide: 'IntegrationUserRepository',
    useClass: Repository<IntegrationUser>,
  },
  {
    provide: 'IntegrationUserAuditLogRepository',
    useClass: Repository<IntegrationUserAuditLog>,
  },
];
