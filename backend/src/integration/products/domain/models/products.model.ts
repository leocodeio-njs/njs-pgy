import { ProductPricing } from './product-pricing.model';
import { SubscriptionTerms } from './subscription-terms.model';

export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export class IIntegrationProduct {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly metadata: Record<string, any>,
    public readonly type: ProductType,
    public readonly startDate: Date,
    public readonly endDate: Date,
    private readonly pricing: ProductPricing[] = [],
    private readonly subscriptionTerms: SubscriptionTerms[] = [],
    private deletedAt?: Date,
    public readonly pgyProductId?: string,
  ) {
    this.validateDates();
    this.validateName();
  }

  private validateDates(): void {
    if (this.startDate > this.endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
  }

  private validateName(): void {
    if (!this.name?.trim()) {
      throw new Error('Product name is required');
    }
  }

  public getPricing(): ProductPricing[] {
    return [...this.pricing];
  }

  public getSubscriptionTerms(): SubscriptionTerms[] {
    return [...this.subscriptionTerms];
  }

  public getPgyPlanId(): string {
    return this.pgyProductId;
  }

  public isActive(date: Date = new Date()): boolean {
    return !this.isDeleted() && date >= this.startDate && date <= this.endDate;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    // Cascade soft delete to related entities
    this.pricing.forEach((pricing) => pricing.softDelete());
    this.subscriptionTerms.forEach((terms) => terms.softDelete());
  }

  public restore(): void {
    this.deletedAt = undefined;
    // Cascade restore to related entities
    this.pricing.forEach((pricing) => pricing.restore());
    this.subscriptionTerms.forEach((terms) => terms.restore());
  }

  // Add method to check valid pricing
  public getValidPricing(date: Date = new Date()): ProductPricing[] {
    return this.pricing.filter((p) => p.isValid(date) && !p.isDeleted());
  }

  // Add method to check valid subscription terms
  public getValidSubscriptionTerms(
    date: Date = new Date(),
  ): SubscriptionTerms[] {
    return this.subscriptionTerms.filter(
      (t) => t.isValid(date) && !t.isDeleted(),
    );
  }

  public isDeleted(): boolean {
    return !!this.deletedAt;
  }

  public getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }
}
