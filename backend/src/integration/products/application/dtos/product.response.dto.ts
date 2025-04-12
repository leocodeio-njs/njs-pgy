// presentation/dtos/product.response.dto.ts
export class PricingResponseDto {
  id: string;
  price: number;
  currency: string;
  tierType: string;
  validFrom: Date;
  validTo: Date;
}

export class TermsResponseDto {
  id: string;
  termPeriod: number;
  termUom: string;
  trialPeriodDays?: number;
  billingFrequency: string;
  eolDate?: Date;
}

export class ProductResponseDto {
  id: string;
  businessId: string;
  name: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  metadata: Record<string, any>;
  pricing: PricingResponseDto[];
  terms: TermsResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(product: any): ProductResponseDto {
    const response = new ProductResponseDto();
    response.id = product.id;
    response.businessId = product.businessId;
    response.name = product.name;
    response.description = product.description;
    response.type = product.type;
    response.startDate = product.startDate;
    response.endDate = product.endDate;
    response.metadata = product.metadata;
    response.createdAt = product.createdAt;
    response.updatedAt = product.updatedAt; // Assuming these fields exist in the entity
    response.pricing = product.pricing?.map((p) => ({
      id: p.id,
      price: p.price,
      currency: p.currency,
      tierType: p.tierType,
      validFrom: p.validFrom,
      validTo: p.validTo,
    }));
    response.terms = product.subscriptionTerms?.map((t) => ({
      id: t.id,
      termPeriod: t.termPeriod,
      termUom: t.termUom,
      trialPeriodDays: t.trialPeriodDays,
      billingFrequency: t.billingFrequency,
      eolDate: t.eolDate,
    }));
    return response;
  }
}
