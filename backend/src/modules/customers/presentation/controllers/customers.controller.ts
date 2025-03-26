import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { CustomersService } from '../../application/services/customers.service';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto';
import {
  AccessTokenAuthGuard,
  ApiKeyGuard,
} from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';

@ApiTags('Customers')
@ApiSecurity('x-api-key')
@ApiBearerAuth('Authorization')
@UseGuards(AccessTokenAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    console.log('createCustomerDto', createCustomerDto);
    return this.customersService.createCustomer(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Returns all customers' })
  async getAllCustomers() {
    return this.customersService.getAllCustomers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Returns customer details' })
  async getCustomerById(@Param('id') id: string) {
    return this.customersService.getCustomerById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer details' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(id, updateCustomerDto);
  }
}
