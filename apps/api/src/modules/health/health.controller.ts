import { Controller, Get, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const result = await this.healthService.check();
    if (result.status === 'error') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async ready() {
    const result = await this.healthService.checkReadiness();
    if (result.status === 'error') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Get('db')
  @HttpCode(HttpStatus.OK)
  async db() {
    const result = await this.healthService.checkDatabase();
    if (result.status === 'error') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Get('redis')
  @HttpCode(HttpStatus.OK)
  async redis() {
    const result = await this.healthService.checkRedis();
    if (result.status === 'error') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}