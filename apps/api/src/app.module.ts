import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { validateEnv } from './config/config.validator';

@Module({
  imports: [
    // Config - loads and validates .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),

    // Health check
    HealthModule,

    // Auth
    AuthModule,

    // Database
    PrismaModule,

    // Redis/Cache
    RedisModule,

    // Queue
    QueueModule,
  ],
})
export class AppModule {}