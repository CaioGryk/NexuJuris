import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  checks?: {
    db?: string;
    redis?: string;
  };
}

export interface ComponentHealth {
  status: 'ok' | 'error';
  message?: string;
}

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async check(): Promise<HealthResponse> {
    const dbStatus = await this.checkDbComponent();
    const redisStatus = await this.checkRedisComponent();

    const allOk = dbStatus.status === 'ok' && redisStatus.status === 'ok';

    return {
      status: allOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: {
        db: dbStatus.status,
        redis: redisStatus.status,
      },
    };
  }

  async checkReadiness(): Promise<HealthResponse> {
    const dbStatus = await this.checkDbComponent();
    const redisStatus = await this.checkRedisComponent();

    const allOk = dbStatus.status === 'ok' && redisStatus.status === 'ok';

    return {
      status: allOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: {
        db: dbStatus.status,
        redis: redisStatus.status,
      },
    };
  }

  async checkDatabase(): Promise<ComponentHealth> {
    return this.checkDbComponent();
  }

  async checkRedis(): Promise<ComponentHealth> {
    return this.checkRedisComponent();
  }

  private async checkDbComponent(): Promise<ComponentHealth> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database unavailable',
      };
    }
  }

  private async checkRedisComponent(): Promise<ComponentHealth> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG' ? { status: 'ok' } : { status: 'error', message: 'Unexpected response' };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Redis unavailable',
      };
    }
  }
}