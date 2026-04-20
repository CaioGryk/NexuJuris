import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  check() {
    return this.healthService.check();
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async ready() {
    return this.healthService.checkReadiness();
  }

  @Get('db')
  @HttpCode(HttpStatus.OK)
  async db() {
    return this.healthService.checkDatabase();
  }

  @Get('redis')
  @HttpCode(HttpStatus.OK)
  async redis() {
    return this.healthService.checkRedis();
  }
}