import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlansService } from '../../application/services/plans.service';
import { CreatePlanDto } from '../../application/dtos/create-plan.dto';

@ApiTags('Plans')
@ApiSecurity('x-api-key')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // create plan
  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.createPlan(createPlanDto);
  }

  // get all plans
  @Get()
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Returns all plans' })
  async getAllPlans() {
    return this.plansService.getPlan();
  }

  // get plan by id
  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Returns plan details' })
  async getPlan(@Param('id') id: string) {
    return this.plansService.getPlan(id);
  }
}
