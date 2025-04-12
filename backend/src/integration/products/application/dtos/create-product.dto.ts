import {
  IsString,
  IsDate,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingDto {
  @ApiProperty({
    description: 'The price of the product in the specified currency.',
    example: 49.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'The currency code for the price.',
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'The tier type of the pricing.',
    enum: ['FREE', 'TRIAL', 'PAID', 'GOODWILL'],
    example: 'PAID',
  })
  @IsEnum(['FREE', 'TRIAL', 'PAID', 'GOODWILL'])
  tierType: string;

  @ApiProperty({
    description: 'The date when the pricing becomes valid.',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({
    description: 'The date when the pricing ends.',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @Type(() => Date)
  validTo: Date;
}

export class CreateTermsDto {
  @ApiProperty({
    description: 'The duration of the term period.',
    example: 12,
  })
  @IsNumber()
  termPeriod: number;

  @ApiProperty({
    description: 'The unit of measure for the term period.',
    enum: ['DAY', 'MONTH', 'YEAR'],
    example: 'MONTH',
  })
  @IsEnum(['DAY', 'MONTH', 'YEAR'])
  termUom: string;

  @ApiProperty({
    description: 'The frequency of billing.',
    enum: ['MONTHLY', 'YEARLY'],
    example: 'MONTHLY',
  })
  @IsEnum(['MONTHLY', 'YEARLY'])
  billingFrequency: string;

  @ApiProperty({
    description: 'The optional trial period in days.',
    example: 14,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  trialPeriodDays?: number;
}

export class CreateProductDto {
  @ApiProperty({
    description:
      'The unique identifier for the business associated with the product.',
    example:"2d8b4f36-c8b7-4a7e-aebe-9c72137b45a8",
  })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: 'The name of the product.',
    example: 'Pro Subscription',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A detailed description of the product.',
    example: 'This is a premium subscription plan with exclusive features.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The type of product being created.',
    enum: ['SUBSCRIPTION'],
    example: 'SUBSCRIPTION',
  })
  @IsEnum(['SUBSCRIPTION'])
  type: string;

  @ApiProperty({
    description: 'The start date of the product availability.',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the product availability.',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: 'An array of pricing options for the product.',
    type: [CreatePricingDto],
    example: [
      {
        price: 49.99,
        currency: 'USD',
        tierType: 'PAID',
        validFrom: '2024-01-01T00:00:00.000Z',
        validTo: '2024-12-31T23:59:59.999Z',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePricingDto)
  pricing: CreatePricingDto[];

  @ApiProperty({
    description: 'An array of terms associated with the product.',
    type: [CreateTermsDto],
    example: [
      {
        termPeriod: 12,
        termUom: 'MONTH',
        billingFrequency: 'MONTHLY',
        trialPeriodDays: 14,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTermsDto)
  terms: CreateTermsDto[];

  @ApiProperty({
    description: 'The Pgy product ID.',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  pgyProductId?: string;
}
