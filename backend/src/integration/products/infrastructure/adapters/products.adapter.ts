import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
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
import { PlansService } from '@/modules/razorpay/plans/application/services/plans.service';
import { PlanPeriod } from '@/modules/razorpay/plans/application/types/plan.types';
import { CreatePlanDto } from '@/modules/razorpay/plans/application/dtos/create-plan.dto';
import { Item } from '@/modules/razorpay/items/application/types/item.types';

@Injectable()
export class ProductRepositoryAdapter implements IProductsPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject('IntegrationProductRepository')
    private readonly productRepo: Repository<IntegrationProduct>,
    @Inject('IntegrationProductPricingRepository')
    private readonly pricingRepo: Repository<IntegrationProductPricing>,
    @Inject('IntegrationSubscriptionTermsRepository')
    private readonly termsRepo: Repository<IntegrationSubscriptionTerms>,
    @Inject('IntegrationProductAuditLogRepository')
    private readonly auditRepo: Repository<IntegrationProductAuditLogEntity>,
    private readonly rzpPlansService: PlansService,
  ) {}

  async findAll(): Promise<IIntegrationProduct[]> {
    const entities = await this.productRepo.find({
      relations: ['pricing', 'subscriptionTerms'],
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
      // rzp plan
      const createPlanDto = new CreatePlanDto();
      createPlanDto.period = product.getSubscriptionTerms()[0].billingFrequency;
      createPlanDto.interval = product.getSubscriptionTerms()[0].termPeriod;
      createPlanDto.item = {
        name: product.name,
        description: product.description,
        amount: product.getPricing()[0].getAmount() * 100,
        currency: 'INR',
      } as Item;
      const rzpPlan = await this.rzpPlansService.createPlan(createPlanDto);

      // integration product
      const entity = this.toEntity(product);

      // set pgy product id
      entity.pgyProductId = rzpPlan.id;

      // save product
      const savedProduct = await this.productRepo.save(entity);

      // save pricing
      const pricing = entity.pricing.map((p) => ({
        ...p,
        productId: savedProduct.id,
      }));
      const terms = entity.subscriptionTerms.map((t) => ({
        ...t,
        productId: savedProduct.id,
      }));

      // save pricing
      await this.pricingRepo.save(pricing);

      // save terms
      await this.termsRepo.save(terms);

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
      const oldProduct = await this.findById(id);
      const entity = this.toEntity(product);

      // update product
      const updatedProduct = await this.productRepo.save({ ...entity, id });

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
      await this.pricingRepo.save(pricing);

      // update terms
      await this.termsRepo.save(terms);

      // Use the audit repository
      await this.auditRepo.save({
        productId: id,
        action: 'UPDATE',
        oldValue: oldProduct,
        newValue: updatedProduct,
        createdAt: new Date(),
        createdBy: 'system', // Replace with actual user ID from context
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
      const oldProduct = await this.findById(id);
      if (!oldProduct) {
        throw new Error('Product not found');
      }

      // soft delete pricing
      await this.pricingRepo.softDelete({ productId: id });

      // soft delete terms
      await this.termsRepo.softDelete({ productId: id });

      // soft delete product
      await this.productRepo.softDelete({ id });

      // soft delete product
      await this.productRepo.softDelete({ id });

      // Use the audit repository
      await this.auditRepo.save({
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
      const oldProduct = await this.findById(id);

      // Use the specific repositories for hard deletes
      await this.pricingRepo.delete({ productId: id });
      await this.termsRepo.delete({ productId: id });
      await this.productRepo.delete({ id });

      // Use the audit repository
      await this.auditRepo.save({
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
