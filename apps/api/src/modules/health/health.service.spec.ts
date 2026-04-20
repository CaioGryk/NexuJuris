import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
    };

    mockRedis = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: mockPrisma, useValue: mockPrisma },
        { provide: mockRedis, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
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
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('DB Error'));

      const result = await service.check();

      expect(result.status).toBe('error');
      expect(result.checks?.db).toBe('error');
    });

    it('should return error when Redis fails', async () => {
      mockRedis.ping = jest.fn().mockRejectedValue(new Error('Redis Error'));

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
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Connection failed'));

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
      mockRedis.ping = jest.fn().mockResolvedValue('UNEXPECTED');

      const result = await service.checkRedis();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Unexpected');
    });

    it('should return error when Redis fails', async () => {
      mockRedis.ping = jest.fn().mockRejectedValue(new Error('Connection refused'));

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
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('DB Error'));

      const result = await service.checkReadiness();

      expect(result.status).toBe('error');
    });
  });
});