import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class EnvConfig {
  @IsString()
  APP_NAME: string = 'nexujuris';

  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @IsNumber()
  PORT: number = 3001;

  @IsString()
  DATABASE_URL: string = '';

  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsString()
  JWT_SECRET: string = '';

  @IsString()
  JWT_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET: string = '';

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: false,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const messages = errors.map((e) => {
      const constraints = e.constraints ? Object.values(e.constraints).join(', ') : 'unknown';
      return `${e.property}: ${constraints}`;
    }).join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}