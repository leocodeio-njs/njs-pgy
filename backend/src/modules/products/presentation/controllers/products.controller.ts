import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { IntegrationProductsService } from '../../application/services/products.service';
import { IIntegrationProduct } from '../../domain/models/products.model';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';

@Controller('products')
export class IntegrationProductsController {
  constructor(private readonly productsService: IntegrationProductsService) {}

  @Get()
  async findAll(): Promise<IIntegrationProduct[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IIntegrationProduct> {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(
    @Body() product: CreateProductDto,
  ): Promise<IIntegrationProduct> {
    return this.productsService.create(product);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Promise<IIntegrationProduct> {
    return this.productsService.update(id, product);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
