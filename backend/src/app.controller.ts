import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
@ApiSecurity('x-api-key')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
