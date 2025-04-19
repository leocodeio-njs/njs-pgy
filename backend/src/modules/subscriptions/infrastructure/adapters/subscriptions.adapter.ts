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
import { IntegrationInvoice } from '../entities/invoices.entity';

@Injectable()
export class SubscriptionRepositoryAdapter implements ISubscriptionsPort {
  constructor(
    @InjectRepository(IntegrationSubscription)
    private readonly subscriptionRepo: Repository<IntegrationSubscription>,
    @InjectRepository(IntegrationSubscriptionAuditLog)
    private readonly auditRepo: Repository<IntegrationSubscriptionAuditLog>,
    @InjectRepository(IntegrationInvoice)
    private readonly invoiceRepo: Repository<IntegrationInvoice>,
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

  async findByUserId(userId: string): Promise<IIntegrationSubscription[]> {
    const entities = await this.subscriptionRepo.find({
      where: { integrationUserId: userId },
      withDeleted: false,
    });
    return entities.map((e) => this.toDomain(e));
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
        console.log('authentic user', authenticUser);
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
      const savedSubscription = await manager.save(IntegrationSubscription, {
        ...entity,
        status: 'CREATED',
      });

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
      const manager = queryRunner.manager;
      const oldSubscription = await this.findById(id);
      if (!oldSubscription) {
        throw new Error('Subscription not found');
      }

      // make the subscription cancelled in razorpay
      const cancelSubscriptionDto = new CancelSubscriptionDto();
      cancelSubscriptionDto.cancel_at_cycle_end = 0;
      await this.rzpSubscriptionsService.cancelSubscription(
        oldSubscription.pgySubscriptionId,
        cancelSubscriptionDto,
      );

      // Update subscription status
      const updatedSubscription = {
        ...oldSubscription,
        status: 'CANCELLED',
        updatedAt: new Date(),
      };
      await manager.save(IntegrationSubscription, updatedSubscription);

      // make the trail subscription active

      // in auth table revert to trail
      const product = await this.productService.findByProductName('trail');
      if (!product) {
        throw new Error('Product not found');
      }
      await manager.query(
        'UPDATE auth.users SET subscriptionTier = $1 WHERE id = $2',
        [product.name, oldSubscription.integrationUserId],
      );

      // in subscription table make the trail subscription active
      const trailProduct = await this.productService.findByProductName('trail');
      if (!trailProduct) {
        throw new Error('Product not found');
      }

      const trailSubscription = await this.subscriptionRepo.findOne({
        where: {
          integrationUserId: oldSubscription.integrationUserId,
          integrationProductId: trailProduct.id,
        },
        withDeleted: false,
      });
      if (!trailSubscription) {
        throw new Error('Trail subscription not found');
      }
      trailSubscription.status = 'ACTIVE';
      await manager.save(IntegrationSubscription, trailSubscription);
      // in invoice table make the trail subscription active
      const trailInvoice = await this.invoiceRepo.findOne({
        where: {
          integrationUserId: oldSubscription.integrationUserId,
          status: 'ACTIVE',
        },
        withDeleted: false,
      });
      if (!trailInvoice) {
        throw new Error('Trail invoice not found');
      }
      trailInvoice.status = 'ACTIVE';
      trailInvoice.paidAt = new Date();
      trailInvoice.billingEnd = new Date(
        Date.now() +
          trailProduct.getSubscriptionTerms()[0].termPeriod * 24 * 60 * 60,
      );
      await manager.save(IntegrationInvoice, trailInvoice);

      // Log the cancellation in audit
      await manager.save(IntegrationSubscriptionAuditLog, {
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

  async getInvoices(userId: string): Promise<any> {
    console.log('function is getting called');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // query manager
      const manager = queryRunner.manager;

      // get subscription by user id
      const subscription = await this.findByUserId(userId);
      console.log('| subscription', subscription);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // get already pooled invoices
      const pooledInvoices = await this.invoiceRepo.find({
        where: { integrationUserId: userId },
        withDeleted: false,
      });
      console.log('pooled invoices', pooledInvoices);

      // Get all invoices for the subscription
      let fetchedInvoices: any[] = [];
      for (const sub of subscription) {
        if (sub.pgySubscriptionId === 'system') {
          continue;
        }
        // get the invoices from razorpay
        const subInvoices =
          await this.rzpSubscriptionsService.getSubscriptionInvoices(
            sub.pgySubscriptionId,
          );
        if (subInvoices instanceof HttpException) {
          throw subInvoices;
        }
        fetchedInvoices = [...subInvoices.items, ...fetchedInvoices];
      }
      console.log('fetched invoices', fetchedInvoices);

      // compare and get newly fetched invoices
      const newInvoices = fetchedInvoices.filter((invoice) => {
        return !pooledInvoices.some(
          (pooledInvoice) => pooledInvoice.razorpayInvoiceId === invoice.id,
        );
      });
      console.log('new invoices', newInvoices);
      if (newInvoices.length === 0) {
        return pooledInvoices;
      } else {
        // save new invoices to the database
        const createdInvoices = newInvoices.map((invoice) => {
          return manager.save(IntegrationInvoice, {
            id: crypto.randomUUID(), // Generate a proper UUID for the primary key
            razorpayInvoiceId: invoice.id,
            razorpayOrderId: invoice.order_id,
            razorpayPaymentId: invoice.payment_id,
            razorpayCustomerId: invoice.customer_id,
            pgySubscriptionId: invoice.subscription_id,
            status: invoice.status,
            invoiceNumber: invoice.invoice_number,
            amount: invoice.amount,
            amountPaid: invoice.amount_paid,
            amountDue: invoice.amount_due,
            currency: invoice.currency,
            shortUrl: invoice.short_url,
            issuedAt: invoice.issued_at
              ? new Date(invoice.issued_at * 1000)
              : null,
            paidAt: invoice.paid_at ? new Date(invoice.paid_at * 1000) : null,
            billingStart: invoice.billing_start
              ? new Date(invoice.billing_start * 1000)
              : null,
            billingEnd: invoice.billing_end
              ? new Date(invoice.billing_end * 1000)
              : null,
            lineItems: invoice.line_items,
            customerDetails: invoice.customer_details,
            integrationUserId: userId,
          });
        });

        await Promise.all(createdInvoices);
        return [...pooledInvoices, ...newInvoices];
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getCurrent(userId: string): Promise<string> {
    console.log('current subscription function is getting called');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      // customer should be created first
      let customerId: string;
      const user = await this.IntUserService.findByIntegrationUserId(userId);
      var authenticUser: any;
      if (!user) {
        // Get user from auth table
        console.log(userId);
        const authUser = await manager.query(
          'SELECT * FROM auth.users WHERE id = $1 LIMIT 1', // only one match
          [userId],
        );
        console.log('auth user', authUser);
        authenticUser = authUser[0];
        console.log('authentic user', authenticUser);
        if (!authenticUser) {
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
        integrationUserData.integrationUserId = userId;
        await manager.save(IntegrationUser, integrationUserData);
        customerId = customer.id;
      } else {
        customerId = user.customerId;
      }
      console.log('customer id', customerId);

      // in subscription table check for existing ones
      const existingSubscription = await this.subscriptionRepo.find({
        where: { integrationUserId: userId },
        withDeleted: false,
      });

      console.log('existing subscription', existingSubscription);

      if (existingSubscription.length > 0) {
        // check if any of them is active
        const activeSubscription = existingSubscription.find(
          (sub) => sub.status === 'ACTIVE',
        );
        if (activeSubscription) {
          // return this.toDomain(activeSubscription);
          // get the product name which is active
          const product = await this.productService.findByIntegrationProductId(
            activeSubscription.integrationProductId,
          );
          return product.name;
        }
      }

      const product = await this.productService.findByProductName('trail');
      console.log('product', product);
      if (!product) {
        throw new Error('Product not found');
      }

      // create new rzp subscription
      // const createSubscriptionDto = new CreateSubscriptionDto();
      // createSubscriptionDto.customer_id = customerId;
      // createSubscriptionDto.plan_id = product.pgyProductId;
      // createSubscriptionDto.total_count =
      //   product.getSubscriptionTerms()[0].termPeriod;
      // const start_at =
      //   Math.floor(Date.now() / 1000) +
      //   product.getSubscriptionTerms()[0].trialPeriodDays * 24 * 60 * 60;
      // createSubscriptionDto.start_at = start_at;

      // console.log('create subscription dto', createSubscriptionDto);

      // const rzpSubscription =
      //   await this.rzpSubscriptionsService.createSubscription(
      //     createSubscriptionDto,
      //   );

      // console.log('razorpay subscription', rzpSubscription);

      const entity = this.toEntity({
        integrationUserId: userId,
        integrationProductId: product.id,
        pgySubscriptionId: 'system',
      });

      // Save subscription using manager
      const savedSubscription = await manager.save(IntegrationSubscription, {
        status: 'ACTIVE',
        ...entity,
      });

      const trailInvoice = new IntegrationInvoice();
      trailInvoice.razorpayInvoiceId = 'system';
      trailInvoice.razorpayOrderId = 'system';
      trailInvoice.razorpayPaymentId = 'system';
      trailInvoice.razorpayCustomerId = customerId;
      trailInvoice.pgySubscriptionId = savedSubscription.pgySubscriptionId;
      trailInvoice.status = 'ACTIVE';
      trailInvoice.invoiceNumber = 'system';
      trailInvoice.amount = 0;
      trailInvoice.amountPaid = 0;
      trailInvoice.amountDue = 0;
      trailInvoice.currency = 'INR';
      trailInvoice.shortUrl = 'system';
      trailInvoice.issuedAt = new Date();
      trailInvoice.paidAt = new Date();
      trailInvoice.billingStart = new Date();
      trailInvoice.billingEnd = new Date(
        Date.now() +
          product.getSubscriptionTerms()[0].termPeriod * 24 * 60 * 60,
      );
      trailInvoice.lineItems = [];
      trailInvoice.customerDetails = {
        name: authenticUser.firstName + ' ' + authenticUser.lastName,
        email: authenticUser.email,
        contact: authenticUser.mobile,
      };
      trailInvoice.integrationUserId = userId;
      trailInvoice.id = crypto.randomUUID();
      await manager.save(IntegrationInvoice, trailInvoice);
      console.log('saved trail invoice', trailInvoice);

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
      return product.name;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async verifySubscription(
    rzpSubscriptionId: string,
  ): Promise<IIntegrationSubscription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const subscription =
        await this.rzpSubscriptionsService.getSubscription(rzpSubscriptionId);
      if (subscription instanceof HttpException) {
        throw subscription;
      }


      // get the subscription from the database
      const dbSubscription = await this.subscriptionRepo.findOne({
        where: { pgySubscriptionId: rzpSubscriptionId },
        withDeleted: false,
      });
      if (!dbSubscription) {
        throw new Error('Subscription not found');
      }

      // update the subscription in the database
      // dbSubscription.status = verifiedStatus.toUpperCase();
      dbSubscription.status = 'ACTIVE';
      dbSubscription.updatedAt = new Date();
      dbSubscription.pgySubscriptionId = rzpSubscriptionId;
      await manager.save(IntegrationSubscription, dbSubscription);

      // make all other subscriptions inactive
      const allSubscriptions = await this.subscriptionRepo.find({
        where: { integrationUserId: dbSubscription.integrationUserId },
        withDeleted: false,
      });
      const inactiveSubscriptions = allSubscriptions.filter(
        (sub) => sub.id !== dbSubscription.id,
      );
      for (const sub of inactiveSubscriptions) {
        sub.status = 'INACTIVE';
        await manager.save(IntegrationSubscription, sub);
      }

      // get the product name
      const product = await this.productService.findByIntegrationProductId(
        dbSubscription.integrationProductId,
      );
      if (!product) {
        throw new Error('Product not found');
      }

      console.log("working")
      // chage the value of subscription in auth user table
      await manager.query(
        'UPDATE auth.users SET subscription_tier = $1 WHERE id = $2',
        [product.name, dbSubscription.integrationUserId],
      );

      // Log audit using manager
      await manager.save(IntegrationSubscriptionAuditLog, {
        subscriptionId: dbSubscription.id,
        action: 'VERIFY',
        oldValue: {},
        newValue: dbSubscription,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
      return this.toDomain(dbSubscription);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
