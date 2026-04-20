import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, ValidateIf, validateSync } from 'class-validator';

enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class AppConfig {
  @IsString()
  APP_NAME: string = 'nexujuris';

  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @IsNumber()
  @ValidateIf((o) => !o.PORT)
  PORT: number = 3001;
}

class DatabaseConfig {
  @IsString()
  DATABASE_URL: string = '';
}

class RedisConfig {
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  REDIS_PORT: number = 6379;

  @ValidateIf((o) => o.REDIS_PASSWORD !== '')
  @IsString()
  REDIS_PASSWORD?: string;

  @IsNumber()
  REDIS_DB: number = 0;
}

export class EnvValidation {
  @Type(() => AppConfig)
  app: AppConfig = new AppConfig();

  @Type(() => DatabaseConfig)
  database: DatabaseConfig = new DatabaseConfig();

  @Type(() => RedisConfig)
  redis: RedisConfig = new RedisConfig();
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvValidation, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const messages = errors.map((e) => `${e.property}: ${e.constraints?.join(', ')}`).join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}