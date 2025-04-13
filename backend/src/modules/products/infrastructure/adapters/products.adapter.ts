import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IProductsPort } from '../../domain/ports/products.port';
import { IIntegrationProduct } from '../../domain/models/products.model';
import { ProductPricing } from '../../domain/models/product-pricing.model';
import { Repository } from 'typeorm';
import { IntegrationProductAuditLogEntity } from '../entities/products-log.entity';
import { SubscriptionTerms } from '../../domain/models/subscription-terms.model';
import { IntegrationProduct } from '../entities/products.entity';
import { IntegrationSubscriptionTerms } from '../entities/subscription-terms.entity';
import { IntegrationProductPricing } from '../entities/products-pricing.entity';
import { PlansService } from '@/integration/razorpay/plans/application/services/plans.service';
import { PlanPeriod } from '@/integration/razorpay/plans/application/types/plan.types';
import { CreatePlanDto } from '@/integration/razorpay/plans/application/dtos/create-plan.dto';
import { Item } from '@/integration/razorpay/items/application/types/item.types';

@Injectable()
export class ProductRepositoryAdapter implements IProductsPort {
  constructor(
    @InjectRepository(IntegrationProduct)
    private readonly productRepo: Repository<IntegrationProduct>,
    @InjectRepository(IntegrationProductPricing)
    private readonly pricingRepo: Repository<IntegrationProductPricing>,
    @InjectRepository(IntegrationSubscriptionTerms)
    private readonly termsRepo: Repository<IntegrationSubscriptionTerms>,
    @InjectRepository(IntegrationProductAuditLogEntity)
    private readonly auditRepo: Repository<IntegrationProductAuditLogEntity>,
    private readonly rzpPlansService: PlansService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<IIntegrationProduct[]> {
    const entities = await this.productRepo.find({
      // relations: ['pricing', 'subscriptionTerms'],
      withDeleted: false,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<IIntegrationProduct | null> {
    const entity = await this.productRepo.findOne({
      where: { id },
      relations: ['pricing', 'subscriptionTerms'],
      withDeleted: false,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPlanId(planId: string): Promise<IIntegrationProduct | null> {
    const entity = await this.productRepo.findOne({
      where: { pgyProductId: planId },
      relations: ['pricing', 'subscriptionTerms'],
      withDeleted: false,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findValidProducts(date: Date): Promise<IIntegrationProduct[]> {
    const entities = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.pricing', 'pricing')
      .leftJoinAndSelect('product.subscriptionTerms', 'terms')
      .where('product.startDate <= :date', { date })
      .andWhere('product.endDate >= :date', { date })
      .andWhere('pricing.validFrom <= :date', { date })
      .andWhere('pricing.validTo >= :date', { date })
      .andWhere('pricing.isActive = :active', { active: true })
      .andWhere('terms.eolDate IS NULL OR terms.eolDate >= :date', { date })
      .andWhere('product.deletedAt IS NULL')
      .andWhere('pricing.deletedAt IS NULL')
      .andWhere('terms.deletedAt IS NULL')
      .getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async save(product: IIntegrationProduct): Promise<IIntegrationProduct> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      // Create Razorpay plan
      const createPlanDto = new CreatePlanDto();
      createPlanDto.period = product
        .getSubscriptionTerms()[0]
        .billingFrequency.toLowerCase() as PlanPeriod;
      createPlanDto.interval = product.getSubscriptionTerms()[0].termPeriod;
      createPlanDto.item = {
        name: product.name,
        description: product.description,
        amount: product.getPricing()[0].getAmount() * 100,
        currency: 'INR',
      } as Item;
      const rzpPlan = await this.rzpPlansService.createPlan(createPlanDto);

      // Prepare entity
      const entity = this.toEntity(product);
      entity.pgyProductId = rzpPlan.id;

      // Save product
      const savedProduct = await manager.save(IntegrationProduct, entity);

      // Save pricing
      const pricing = entity.pricing.map((p) => ({
        ...p,
        productId: savedProduct.id,
      }));
      await manager.save(IntegrationProductPricing, pricing);

      // Save subscription terms
      const terms = entity.subscriptionTerms.map((t) => ({
        ...t,
        productId: savedProduct.id,
      }));
      await manager.save(IntegrationSubscriptionTerms, terms);

      // Save audit log
      await manager.save(IntegrationProductAuditLogEntity, {
        productId: savedProduct.id,
        action: 'CREATE',
        oldValue: {},
        newValue: savedProduct,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
      return this.toDomain(await this.findById(savedProduct.id));
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    product: IIntegrationProduct,
  ): Promise<IIntegrationProduct> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const oldProduct = await this.findById(id);
      const entity = this.toEntity(product);

      // create new rzp plan
      const createPlanDto = new CreatePlanDto();
      createPlanDto.period = product
        .getSubscriptionTerms()[0]
        .billingFrequency.toLowerCase() as PlanPeriod;
      createPlanDto.interval = product.getSubscriptionTerms()[0].termPeriod;
      createPlanDto.item = {
        name: product.name,
        description: product.description,
        amount: product.getPricing()[0].getAmount() * 100,
        currency: 'INR',
      } as Item;
      const rzpPlan = await this.rzpPlansService.createPlan(createPlanDto);

      // update product
      const updatedProduct = await manager.save(IntegrationProduct, {
        ...entity,
        id,
        pgyProductId: rzpPlan.id,
      });

      // update pricing and terms with the correct productId
      const pricing = entity.pricing.map((p) => ({
        ...p,
        productId: id,
      }));
      const terms = entity.subscriptionTerms.map((t) => ({
        ...t,
        productId: id,
      }));

      // update pricing
      await manager.save(IntegrationProductPricing, pricing);

      // update terms
      await manager.save(IntegrationSubscriptionTerms, terms);

      // Use the audit repository
      await manager.save(IntegrationProductAuditLogEntity, {
        productId: id,
        action: 'UPDATE',
        oldValue: oldProduct,
        newValue: updatedProduct,
        createdAt: new Date(),
        createdBy: 'system',
      });

      await queryRunner.commitTransaction();
      return this.toDomain(await this.findById(id));
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
      const oldProduct = await this.findById(id);
      if (!oldProduct) {
        throw new Error('Product not found');
      }

      // soft delete pricing
      await manager.softDelete(IntegrationProductPricing, { productId: id });

      // soft delete terms
      await manager.softDelete(IntegrationSubscriptionTerms, { productId: id });

      // soft delete product
      await manager.softDelete(IntegrationProduct, { id });

      // Use the audit repository
      await manager.save(IntegrationProductAuditLogEntity, {
        productId: id,
        action: 'SOFT_DELETE',
        oldValue: oldProduct,
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

  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const oldProduct = await this.findById(id);

      // Use the manager for hard deletes
      await manager.delete(IntegrationProductPricing, { productId: id });
      await manager.delete(IntegrationSubscriptionTerms, { productId: id });
      await manager.delete(IntegrationProduct, { id });

      // Use the audit repository
      await manager.save(IntegrationProductAuditLogEntity, {
        productId: id,
        action: 'DELETE',
        oldValue: oldProduct,
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

  // Update toEntity and toDomain methods to handle deletedAt
  private toDomain(entity: any): IIntegrationProduct {
    const pricing = entity.pricing?.map(
      (p) =>
        new ProductPricing(
          p.id,
          p.productId,
          p.price,
          p.currency,
          p.tierType,
          p.isActive,
          p.validFrom,
          p.validTo,
          p.deletedAt,
        ),
    );

    const terms = entity.subscriptionTerms?.map(
      (t) =>
        new SubscriptionTerms(
          t.id,
          t.productId,
          t.termPeriod,
          t.termUom,
          t.trialPeriodDays,
          t.billingFrequency,
          t.eolDate,
          t.description,
          t.deletedAt,
        ),
    );

    const product = new IIntegrationProduct(
      entity.id,
      entity.businessId,
      entity.name,
      entity.description,
      entity.metadata,
      entity.type,
      entity.startDate,
      entity.endDate,
      pricing,
      terms,
      entity.deletedAt,
    );

    if (entity.deletedAt) {
      product.softDelete();
    }

    return product;
  }

  private toEntity(domain: IIntegrationProduct): any {
    return {
      id: domain.id,
      businessId: domain.businessId,
      name: domain.name,
      description: domain.description,
      metadata: domain.metadata,
      type: domain.type,
      startDate: domain.startDate,
      endDate: domain.endDate,
      deletedAt: domain.getDeletedAt(),
      createdAt: new Date(),
      updatedAt: new Date(),
      pgyProductId: domain.pgyProductId,
      pricing: domain.getPricing().map((p) => ({
        id: p.id,
        productId: p.productId,
        price: p.getAmount(),
        currency: p.getCurrency(),
        tierType: p.tierType,
        isActive: p.isActive,
        validFrom: p.validFrom,
        validTo: p.validTo,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: p.getDeletedAt(),
      })),
      subscriptionTerms: domain.getSubscriptionTerms().map((t) => ({
        id: t.id,
        productId: t.productId,
        termPeriod: t.termPeriod,
        termUom: t.termUom,
        trialPeriodDays: t.trialPeriodDays,
        billingFrequency: t.billingFrequency,
        eolDate: t.eolDate,
        description: t.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: t.getDeletedAt(),
      })),
    };
  }
}
