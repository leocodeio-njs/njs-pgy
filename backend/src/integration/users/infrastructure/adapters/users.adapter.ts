import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IUsersPort } from '../../domain/ports/users.port';
import { IntegrationUser } from '../entities/users.entity';
import { IntegrationUserAuditLog } from '../entities/users-log.entity';
import { IIntegrationUser } from '../../domain/models/users.model';

@Injectable()
export class UserRepositoryAdapter implements IUsersPort {
  constructor(
    @InjectRepository(IntegrationUser)
    private readonly userRepo: Repository<IntegrationUser>,
    @InjectRepository(IntegrationUserAuditLog)
    private readonly auditRepo: Repository<IntegrationUserAuditLog>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<IIntegrationUser[]> {
    const entities = await this.userRepo.find({
      withDeleted: false,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findOne(id: string): Promise<IIntegrationUser> {
    const entity = await this.userRepo.findOne({
      where: { id },
      withDeleted: false,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<IIntegrationUser[]> {
    const entities = await this.userRepo.find({
      where: { customerId },
      withDeleted: false,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByIntegrationUserId(
    integrationUserId: string,
  ): Promise<IIntegrationUser> {
    const entity = await this.userRepo.findOne({
      where: { integrationUserId },
      withDeleted: false,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: IIntegrationUser): Promise<IIntegrationUser> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entity = this.toEntity(user);
      const savedUser = await this.userRepo.save(entity);

      // Add audit log for creation
      await this.auditRepo.save({
        userId: savedUser.id,
        action: 'CREATE',
        oldValue: null,
        newValue: savedUser,
        createdAt: new Date(),
        createdBy: 'system', // Replace with actual user ID from context
      });

      await queryRunner.commitTransaction();
      return this.toDomain(savedUser);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, user: IIntegrationUser): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldUser = await this.findOne(id);
      const entity = this.toEntity(user);
      const updatedUser = await this.userRepo.save({ ...entity, id });

      // Add audit log for update
      await this.auditRepo.save({
        userId: id,
        action: 'UPDATE',
        oldValue: oldUser,
        newValue: updatedUser,
        createdAt: new Date(),
        createdBy: 'system', // Replace with actual user ID from context
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldUser = await this.findOne(id);
      await this.userRepo.delete(id);

      // Add audit log for deletion
      await this.auditRepo.save({
        userId: id,
        action: 'DELETE',
        oldValue: oldUser,
        newValue: null,
        createdAt: new Date(),
        createdBy: 'system', // Replace with actual user ID from context
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private toDomain(entity: IntegrationUser): IIntegrationUser {
    return new IIntegrationUser(
      entity.name,
      entity.email,
      entity.phone,
      entity.customerId,
      entity.integrationUserId,
    );
  }

  private toEntity(domain: IIntegrationUser): Partial<IntegrationUser> {
    return {
      name: domain.name,
      email: domain.email,
      phone: domain.phone,
      customerId: domain.customerId,
      integrationUserId: domain.integrationUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
