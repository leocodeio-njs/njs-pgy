// domain/value-objects/price.vo.ts
export class Price {
  constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    this.validateAmount();
    this.validateCurrency();
  }

  private validateAmount(): void {
    if (this.amount < 0) {
      throw new Error('Price amount cannot be negative');
    }
  }

  private validateCurrency(): void {
    if (this.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code');
    }
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
