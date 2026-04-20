import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
    };

    const mockRedis = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return ok when both DB and Redis are connected', async () => {
      const result = await service.check();

      expect(result.status).toBe('ok');
      expect(result.checks?.db).toBe('ok');
      expect(result.checks?.redis).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });

    it('should return error when database fails', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValueOnce(new Error('DB Error'));

      const result = await service.check();

      expect(result.status).toBe('error');
      expect(result.checks?.db).toBe('error');
    });

    it('should return error when Redis fails', async () => {
      jest.spyOn(redisService, 'ping').mockRejectedValueOnce(new Error('Redis Error'));

      const result = await service.check();

      expect(result.status).toBe('error');
      expect(result.checks?.redis).toBe('error');
    });
  });

  describe('checkDatabase', () => {
    it('should return ok when database is connected', async () => {
      const result = await service.checkDatabase();

      expect(result.status).toBe('ok');
    });

    it('should return error when database fails', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.checkDatabase();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Connection failed');
    });
  });

  describe('checkRedis', () => {
    it('should return ok when Redis responds with PONG', async () => {
      const result = await service.checkRedis();

      expect(result.status).toBe('ok');
    });

    it('should return error when Redis returns unexpected response', async () => {
      jest.spyOn(redisService, 'ping').mockResolvedValueOnce('UNEXPECTED');

      const result = await service.checkRedis();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Unexpected');
    });

    it('should return error when Redis fails', async () => {
      jest.spyOn(redisService, 'ping').mockRejectedValueOnce(new Error('Connection refused'));

      const result = await service.checkRedis();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Connection refused');
    });
  });

  describe('checkReadiness', () => {
    it('should return ok when all dependencies are ready', async () => {
      const result = await service.checkReadiness();

      expect(result.status).toBe('ok');
    });

    it('should return error when any dependency is not ready', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValueOnce(new Error('DB Error'));

      const result = await service.checkReadiness();

      expect(result.status).toBe('error');
    });
  });
});