import { IIntegrationProduct } from '../models/products.model';

export abstract class IProductsPort {
  abstract findAll(): Promise<IIntegrationProduct[]>;
  abstract findById(id: string): Promise<IIntegrationProduct | null>;
  abstract findValidProducts(date: Date): Promise<IIntegrationProduct[]>;
  abstract save(product: IIntegrationProduct): Promise<IIntegrationProduct>;
  abstract update(
    id: string,
    product: IIntegrationProduct,
  ): Promise<IIntegrationProduct>;
  abstract findByPlanId(planId: string): Promise<IIntegrationProduct | null>;
  abstract findByIntegrationProductId(
    integrationProductId: string,
  ): Promise<IIntegrationProduct | null>;
  abstract softDelete(id: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
