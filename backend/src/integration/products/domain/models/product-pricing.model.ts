import { Price } from '../value-objects/price.vo';

export enum PricingTier {
  FREE = 'FREE',
  TRIAL = 'TRIAL',
  PAID = 'PAID',
  GOODWILL = 'GOODWILL',
}

export class ProductPricing {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    private readonly amount: number,
    public readonly currency: string,
    public readonly tierType: PricingTier,
    public readonly isActive: boolean,
    public readonly validFrom: Date,
    public readonly validTo: Date,
    private deletedAt?: Date,
  ) {
    this.validatePricing();
    this.validateDates();
  }

  private validatePricing(): void {
    if (this.tierType === PricingTier.PAID && this.amount <= 0) {
      throw new Error('Paid tier must have a positive price');
    }
    if (
      [PricingTier.FREE, PricingTier.TRIAL].includes(this.tierType) &&
      this.amount !== 0
    ) {
      throw new Error('Free and Trial tiers must have zero price');
    }
  }

  private validateDates(): void {
    if (this.validFrom > this.validTo) {
      throw new Error(
        'Valid from date must be before or equal to valid to date',
      );
    }
  }

  public getPrice(): Price {
    return new Price(this.amount, this.currency);
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public isValid(date: Date = new Date()): boolean {
    return (
      !this.isDeleted() &&
      this.isActive &&
      date >= this.validFrom &&
      date <= this.validTo
    );
  }

  public softDelete(): void {
    this.deletedAt = new Date();
  }

  public restore(): void {
    this.deletedAt = undefined;
  }

  public isDeleted(): boolean {
    return !!this.deletedAt;
  }

  public getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }
}
