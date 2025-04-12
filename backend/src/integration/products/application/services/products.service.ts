import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import {
  IIntegrationProduct,
  ProductType,
} from '../../domain/models/products.model';
import { IProductsPort } from '../../domain/ports/products.port';
import { ProductPricing } from '../../domain/models/product-pricing.model';
import { PricingTier } from '../../domain/models/product-pricing.model';
import {
  SubscriptionTerms,
  TermUnit,
  BillingFrequency,
} from '../../domain/models/subscription-terms.model';
import { PlanPeriod } from '@/modules/razorpay/plans/application/types/plan.types';
@Injectable()
export class IntegrationProductsService {
  constructor(private readonly productPort: IProductsPort) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<IIntegrationProduct> {
    try {
      const product = new IIntegrationProduct(
        undefined,
        createProductDto.businessId,
        createProductDto.name,
        createProductDto.description,
        {},
        createProductDto.type as ProductType,
        createProductDto.startDate,
        createProductDto.endDate,
        createProductDto.pricing.map(
          (pricing) =>
            new ProductPricing(
              undefined,
              undefined,
              pricing.price,
              pricing.currency,
              pricing.tierType as PricingTier,
              true,
              pricing.validFrom,
              pricing.validTo,
              undefined,
            ),
        ),
        createProductDto.terms.map(
          (terms) =>
            new SubscriptionTerms(
              undefined,
              undefined,
              terms.termPeriod,
              terms.termUom as TermUnit,
              terms.trialPeriodDays || null,
              terms.billingFrequency as PlanPeriod,
              null,
              undefined,
              undefined,
            ),
        ),
        undefined,
        createProductDto.pgyProductId,
      );
      return await this.productPort.save(product);
    } catch (error) {
      console.error('Product creation error:', {
        dto: createProductDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAll(): Promise<IIntegrationProduct[]> {
    return this.productPort.findAll();
  }

  async findOne(id: string): Promise<IIntegrationProduct> {
    try {
      if (!id) {
        throw new NotFoundException('Product ID is required');
      }
      const product = await this.productPort.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      console.error('Find product error:', {
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<IIntegrationProduct> {
    try {
      const existingProduct = await this.findOne(id);
      const product = new IIntegrationProduct(
        existingProduct.id,
        updateProductDto.businessId,
        updateProductDto.name,
        updateProductDto.description,
        existingProduct.metadata,
        updateProductDto.type as ProductType,
        updateProductDto.startDate,
        updateProductDto.endDate,
        updateProductDto.pricing.map(
          (pricing) =>
            new ProductPricing(
              pricing.id,
              existingProduct.id,
              pricing.price,
              pricing.currency,
              pricing.tierType as PricingTier,
              true, // maintain active status
              pricing.validFrom,
              pricing.validTo,
              undefined, // deletedAt
            ),
        ),
        updateProductDto.terms.map(
          (terms) =>
            new SubscriptionTerms(
              terms.id,
              existingProduct.id,
              terms.termPeriod,
              terms.termUom as TermUnit,
              terms.trialPeriodDays || null,
              terms.billingFrequency as PlanPeriod,
              null, // eolDate
              undefined, // description
              undefined, // deletedAt
            ),
        ),
      );
      return await this.productPort.update(id, product);
    } catch (error) {
      console.error('Update product error:', {
        id,
        dto: updateProductDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.findOne(id);
      await this.productPort.softDelete(id);
    } catch (error) {
      console.error('Delete product error:', {
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findValidProducts(date: Date): Promise<IIntegrationProduct[]> {
    try {
      return await this.productPort.findValidProducts(date);
    } catch (error) {
      console.error('Find valid products error:', {
        date,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
