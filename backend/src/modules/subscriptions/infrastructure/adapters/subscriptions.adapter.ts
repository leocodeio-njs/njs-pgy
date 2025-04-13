import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ISubscriptionsPort } from '../../domain/ports/subscriptions.port';
import { IIntegrationSubscription } from '../../domain/models/subscriptions.model';
import { IntegrationSubscription } from '../entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from '../entities/subscriptions-log.entity';
import { CreateSubscriptionDto } from '@/integration/razorpay/subscriptions/application/dtos/create-subscription.dto';
// import { UpdateSubscriptionDto } from '@/modules/razorpay/subscriptions/application/dtos/update-subscription.dto';
import { CancelSubscriptionDto } from '@/integration/razorpay/subscriptions/application/dtos/cancel-subscription.dto';
import { IntegrationProductsService } from '@/modules/products/application/services/products.service';
import { SubscriptionsService } from '@/integration/razorpay/subscriptions/application/services/subscriptions.service';
import { CustomersService } from '@/integration/razorpay/customers/application/services/customers.service';
import { IntegrationUsersService } from '@/modules/users/application/services/users.service';
import { CreateCustomerDto } from '@/integration/razorpay/customers/application/dtos/create-customer.dto';
import { IntegrationUser } from '@/modules/users/infrastructure/entities/users.entity';

@Injectable()
export class SubscriptionRepositoryAdapter implements ISubscriptionsPort {
  constructor(
    @InjectRepository(IntegrationSubscription)
    private readonly subscriptionRepo: Repository<IntegrationSubscription>,
    @InjectRepository(IntegrationSubscriptionAuditLog)
    private readonly auditRepo: Repository<IntegrationSubscriptionAuditLog>,
    private readonly productService: IntegrationProductsService,
    private readonly rzpSubscriptionsService: SubscriptionsService,
    private readonly customerService: CustomersService,
    private readonly IntUserService: IntegrationUsersService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

    const manager = queryRunner.manager;
    try {
      // customer should be created first
      let customerId: string;
      const user = await this.IntUserService.findByIntegrationUserId(
        subscription.integrationUserId,
      );

      if (!user) {
        // Get user from auth table
        const authUser = await manager.query(
          'SELECT * FROM auth.users WHERE id = $1 LIMIT 1', // only one match
          [subscription.integrationUserId],
        );
        const authenticUser = authUser[0];
        if (!authUser) {
          throw new Error('User not found');
        }
        // Create customer in razorpay
        const customerData = new CreateCustomerDto();
        customerData.name =
          authenticUser.firstName + ' ' + authenticUser.lastName;
        customerData.email = authenticUser.email;
        customerData.contact = authenticUser.mobile;
        const customer =
          await this.customerService.createCustomer(customerData);

        // create a record in the integration_users table
        const integrationUserData = new IntegrationUser();
        integrationUserData.name =
          authenticUser.firstName + ' ' + authenticUser.lastName;
        integrationUserData.email = authenticUser.email;
        integrationUserData.phone = authenticUser.mobile;
        if (customer instanceof HttpException) {
          throw customer;
        }
        integrationUserData.customerId = customer.id;
        integrationUserData.integrationUserId = subscription.integrationUserId;
        await manager.save(IntegrationUser, integrationUserData);
        customerId = customer.id;
      } else {
        customerId = user.customerId;
      }
      console.log('newly created customer id', customerId);
      // create new rzp subscription
      const createSubscriptionDto = new CreateSubscriptionDto();
      createSubscriptionDto.customer_id = customerId;
      const product = await this.productService.findByIntegrationProductId(
        subscription.integrationProductId,
      );
      if (!product) {
        throw new Error('Product not found');
      }
      createSubscriptionDto.plan_id = product.pgyProductId;
      createSubscriptionDto.total_count =
        product.getSubscriptionTerms()[0].termPeriod;

      const rzpSubscription =
        await this.rzpSubscriptionsService.createSubscription(
          createSubscriptionDto,
        );

      const entity = this.toEntity(subscription);
      entity.pgySubscriptionId = rzpSubscription.id;

      // Save subscription using manager
      const savedSubscription = await manager.save(
        IntegrationSubscription,
        entity,
      );

      // Log audit using manager
      await manager.save(IntegrationSubscriptionAuditLog, {
        subscriptionId: savedSubscription.id,
        action: 'CREATE',
        oldValue: {},
        newValue: savedSubscription,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
      return this.toDomain(savedSubscription);
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
      const manager = queryRunner.manager;
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      const entity = this.toEntity(subscription);
      const updatedSubscription = await manager.save(IntegrationSubscription, {
        ...entity,
        id,
      });

      // Log audit using manager
      await manager.save(IntegrationSubscriptionAuditLog, {
        subscriptionId: id,
        action: 'UPDATE',
        oldValue: oldSubscription,
        newValue: updatedSubscription,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
      return this.toDomain(updatedSubscription);
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
      const manager = queryRunner.manager;
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      // Delete using manager
      await manager.delete(IntegrationSubscription, { id });

      const cancelSubscriptionDto = new CancelSubscriptionDto();
      cancelSubscriptionDto.cancel_at_cycle_end = 1;
      await this.rzpSubscriptionsService.cancelSubscription(
        oldSubscription.pgySubscriptionId,
        cancelSubscriptionDto,
      );

      // Log audit using manager
      await manager.save(IntegrationSubscriptionAuditLog, {
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
      const manager = queryRunner.manager;
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      // Soft delete using manager
      await manager.softDelete(IntegrationSubscription, { id });

      // Log audit using manager
      await manager.save(IntegrationSubscriptionAuditLog, {
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
      entity.integrationUserId,
      entity.integrationProductId,
      entity.pgySubscriptionId,
    );
  }

  private toEntity(domain: IIntegrationSubscription): any {
    return {
      id: crypto.randomUUID(),
      integrationUserId: domain.integrationUserId,
      integrationProductId: domain.integrationProductId,
      pgySubscriptionId: domain.pgySubscriptionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }
}
