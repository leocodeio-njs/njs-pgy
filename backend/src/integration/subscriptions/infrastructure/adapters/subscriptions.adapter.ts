import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ISubscriptionsPort } from '../../domain/ports/subscriptions.port';
import { IIntegrationSubscription } from '../../domain/models/subscriptions.model';
import { IntegrationSubscription } from '../entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from '../entities/subscriptions-log.entity';

@Injectable()
export class SubscriptionRepositoryAdapter implements ISubscriptionsPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject('IntegrationSubscriptionRepository')
    private readonly subscriptionRepo: Repository<IntegrationSubscription>,
    @Inject('IntegrationSubscriptionAuditLogRepository')
    private readonly auditRepo: Repository<IntegrationSubscriptionAuditLog>,
  ) {}

  async findAll(): Promise<IIntegrationSubscription[]> {
    const entities = await this.subscriptionRepo.find({
      withDeleted: false,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<IIntegrationSubscription | null> {
    const entity = await this.subscriptionRepo.findOne({
      where: { id },
      withDeleted: false,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entity = this.toEntity(subscription);
      const savedSubscription = await this.subscriptionRepo.save(entity);

      // Log the creation in audit
      await this.auditRepo.save({
        subscriptionId: savedSubscription.id,
        action: 'CREATE',
        oldValue: null,
        newValue: savedSubscription,
        createdAt: new Date(),
        createdBy: 'system', // Replace with actual user ID from context
      });

      await queryRunner.commitTransaction();
      return await this.findById(savedSubscription.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    subscription: IIntegrationSubscription,
  ): Promise<IIntegrationSubscription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldSubscription = await this.findById(id);
      const entity = this.toEntity(subscription);

      // Update subscription
      const updatedSubscription = await this.subscriptionRepo.save({
        ...entity,
        id,
      });

      // Log the update in audit
      await this.auditRepo.save({
        subscriptionId: id,
        action: 'UPDATE',
        oldValue: oldSubscription,
        newValue: updatedSubscription,
        createdAt: new Date(),
        createdBy: 'system', // Replace with actual user ID from context
      });

      await queryRunner.commitTransaction();
      return await this.findById(id);
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
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      // Delete subscription
      await this.subscriptionRepo.delete({ id });

      // Log the deletion in audit
      await this.auditRepo.save({
        subscriptionId: id,
        action: 'DELETE',
        oldValue: oldSubscription,
        newValue: null,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      // Soft delete subscription
      await this.subscriptionRepo.softDelete({ id });

      // Log the soft deletion in audit
      await this.auditRepo.save({
        subscriptionId: id,
        action: 'SOFT_DELETE',
        oldValue: oldSubscription,
        newValue: null,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      const updatedSubscription = {
        ...oldSubscription,
        status: 'CANCELLED',
        updatedAt: new Date(),
      };

      // Update subscription status
      await this.subscriptionRepo.save(updatedSubscription);

      // Log the cancellation in audit
      await this.auditRepo.save({
        subscriptionId: id,
        action: 'CANCEL',
        oldValue: oldSubscription,
        newValue: updatedSubscription,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getInvoices(id: string): Promise<any> {
    return [];
  }

  async findOne(id: string): Promise<IIntegrationSubscription | null> {
    return this.findById(id);
  }

  private toDomain(entity: IntegrationSubscription): IIntegrationSubscription {
    return new IIntegrationSubscription(
      entity.customerId,
      entity.planId,
      entity.integrationProductId,
      entity.status,
      entity.pgySubscriptionId,
    );
  }

  private toEntity(domain: IIntegrationSubscription): any {
    return {
      id: crypto.randomUUID(),
      customerId: domain.customerId,
      planId: domain.planId,
      integrationProductId: domain.integrationProductId,
      pgySubscriptionId: domain.pgySubscriptionId,
      status: domain.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }
}
