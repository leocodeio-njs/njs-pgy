import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class UpdatePricingDto {
  @ApiProperty({
    description: 'The unique identifier for the pricing option (optional).',
    example: 'price_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'The updated price of the product.',
    example: 59.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'The currency code for the updated price.',
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'The updated tier type for the pricing.',
    enum: ['FREE', 'TRIAL', 'PAID', 'GOODWILL'],
    example: 'PAID',
  })
  @IsEnum(['FREE', 'TRIAL', 'PAID', 'GOODWILL'])
  tierType: string;

  @ApiProperty({
    description: 'The updated start date for the pricing.',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({
    description: 'The updated end date for the pricing.',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @Type(() => Date)
  validTo: Date;
}

export class UpdateTermsDto {
  @ApiProperty({
    description: 'The unique identifier for the term (optional).',
    example: 'term_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'The updated duration of the term period.',
    example: 6,
  })
  @IsNumber()
  termPeriod: number;

  @ApiProperty({
    description: 'The unit of measure for the updated term period.',
    enum: ['DAY', 'MONTH', 'YEAR'],
    example: 'MONTH',
  })
  @IsEnum(['DAY', 'MONTH', 'YEAR'])
  termUom: string;

  @ApiProperty({
    description: 'The updated billing frequency for the term.',
    enum: ['MONTHLY', 'YEARLY'],
    example: 'MONTHLY',
  })
  @IsEnum(['MONTHLY', 'YEARLY'])
  billingFrequency: string;

  @ApiProperty({
    description: 'The updated trial period in days (optional).',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  trialPeriodDays?: number;
}

export class UpdateProductDto {
  @ApiProperty({
    description:
      'The unique identifier for the business associated with the product.',
    example: '2d8b4f36-c8b7-4a7e-aebe-9c72137b45a8',
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
    example: 'This is an updated premium subscription plan.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The type of product being updated.',
    enum: ['SUBSCRIPTION'],
    example: 'SUBSCRIPTION',
  })
  @IsEnum(['SUBSCRIPTION'])
  type: string;

  @ApiProperty({
    description: 'The updated start date of the product availability.',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'The updated end date of the product availability.',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: 'An array of updated pricing options for the product.',
    type: [UpdatePricingDto],
    example: [
      {
        id: 'price_123',
        price: 59.99,
        currency: 'USD',
        tierType: 'PAID',
        validFrom: '2024-01-01T00:00:00.000Z',
        validTo: '2024-12-31T23:59:59.999Z',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePricingDto)
  pricing: UpdatePricingDto[];

  @ApiProperty({
    description: 'An array of updated terms associated with the product.',
    type: [UpdateTermsDto],
    example: [
      {
        id: 'term_123',
        termPeriod: 12,
        termUom: 'MONTH',
        billingFrequency: 'YEARLY',
        trialPeriodDays: 14,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTermsDto)
  terms: UpdateTermsDto[];
}
