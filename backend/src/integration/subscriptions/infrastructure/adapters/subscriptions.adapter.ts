import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ISubscriptionsPort } from '../../domain/ports/subscriptions.port';
import { IIntegrationSubscription } from '../../domain/models/subscriptions.model';
import { IntegrationSubscription } from '../entities/subscriptions.entity';
import { IntegrationSubscriptionAuditLog } from '../entities/subscriptions-log.entity';
import { CreateSubscriptionDto } from '@/modules/razorpay/subscriptions/application/dtos/create-subscription.dto';
// import { UpdateSubscriptionDto } from '@/modules/razorpay/subscriptions/application/dtos/update-subscription.dto';
import { CancelSubscriptionDto } from '@/modules/razorpay/subscriptions/application/dtos/cancel-subscription.dto';
import { IntegrationProductsService } from '@/integration/products/application/services/products.service';
import { SubscriptionsService } from '@/modules/razorpay/subscriptions/application/services/subscriptions.service';
import { CustomersService } from '@/modules/razorpay/customers/application/services/customers.service';
import { IntegrationUsersService } from '@/integration/users/application/services/users.service';
import { CreateCustomerDto } from '@/modules/razorpay/customers/application/dtos/create-customer.dto';
import { IntegrationUser } from '@/integration/users/infrastructure/entities/users.entity';

@Injectable()
export class SubscriptionRepositoryAdapter implements ISubscriptionsPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject('IntegrationSubscriptionRepository')
    private readonly subscriptionRepo: Repository<IntegrationSubscription>,
    @Inject('IntegrationSubscriptionAuditLogRepository')
    private readonly auditRepo: Repository<IntegrationSubscriptionAuditLog>,
    private readonly productService: IntegrationProductsService,
    private readonly rzpSubscriptionsService: SubscriptionsService,
    private readonly customerService: CustomersService,
    private readonly IntUserService: IntegrationUsersService,
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
      // customer should be created first
      let customerId: string;
      const user = await this.IntUserService.findByIntegrationUserId(
        subscription.integrationUserId,
      );
      if (!user) {
        // Get user from auth table
        const authUser = await this.dataSource.query(
          'SELECT * FROM auth.users WHERE id = $1',
          [subscription.integrationUserId],
        );

        // Create customer in razorpay
        const customerData = new CreateCustomerDto();
        customerData.name = authUser.first_name + ' ' + authUser.last_name;
        customerData.email = authUser.email;
        customerData.contact = authUser.mobile;
        const customer =
          await this.customerService.createCustomer(customerData);

        // create a record in the integration_users table
        const integrationUser = new IntegrationUser();
        integrationUser.name = authUser.firstName + ' ' + authUser.lastName;
        integrationUser.email = authUser.email;
        integrationUser.phone = authUser.mobile;
        if (customer instanceof HttpException) {
          throw customer;
        }
        integrationUser.customerId = customer.id;
        await this.IntUserService.save(integrationUser);
        // set the customer id
        customerId = customer.id;
      } else {
        // set the customer id
        customerId = user.customerId;
      }

      // create new rzp subscription
      const createSubscriptionDto = new CreateSubscriptionDto();
      createSubscriptionDto.customer_id = customerId;
      createSubscriptionDto.plan_id = subscription.planId;
      // get the product to get the subscription terms
      const product = await this.productService.findByPlanId(
        subscription.planId,
      );
      createSubscriptionDto.total_count =
        product.getSubscriptionTerms()[0].termPeriod;

      const rzpSubscription =
        await this.rzpSubscriptionsService.createSubscription(
          createSubscriptionDto,
        );

      const entity = this.toEntity(subscription);
      // set the pgy subscription id
      entity.pgySubscriptionId = rzpSubscription.id;
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
      // find the old subscription
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      // [TODO] to update subscription, we need to call the rzp service

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

      // [TODO] to cancel subscription, we need to call the rzp service
      const cancelSubscriptionDto = new CancelSubscriptionDto();

      // cancel at cycle end or not should be decided
      cancelSubscriptionDto.cancel_at_cycle_end = 1;
      await this.rzpSubscriptionsService.cancelSubscription(
        oldSubscription.pgySubscriptionId,
        cancelSubscriptionDto,
      );

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
