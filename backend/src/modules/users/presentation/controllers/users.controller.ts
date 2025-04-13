import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  Put,
} from '@nestjs/common';
import { IntegrationUser } from '../../infrastructure/entities/users.entity';
import { IntegrationUsersService } from '../../application/services/users.service';
import { IIntegrationUser } from '../../domain/models/users.model';

@Controller('users')
export class IntegrationUsersController {
  constructor(private readonly usersService: IntegrationUsersService) {}

  @Get()
  async findAll(): Promise<IIntegrationUser[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IIntegrationUser> {
    return this.usersService.findOne(id);
  }

  @Get('customer/:customerId')
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<IIntegrationUser[]> {
    return this.usersService.findByCustomerId(customerId);
  }

  @Get('integration-user/:integrationUserId')
  async findByIntegrationUserId(
    @Param('integrationUserId') integrationUserId: string,
  ): Promise<IIntegrationUser> {
    return this.usersService.findByIntegrationUserId(integrationUserId);
  }

  @Post()
  async create(@Body() user: IIntegrationUser): Promise<IIntegrationUser> {
    return this.usersService.save(user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() user: IntegrationUser,
  ): Promise<void> {
    return this.usersService.update(id, user);
  }
}
