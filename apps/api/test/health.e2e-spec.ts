import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let baseURL: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    baseURL = app.getHttpServer().url;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('should return 200 with status ok when all dependencies are healthy', async () => {
      const response = await request(baseURL).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.db).toBeDefined();
      expect(response.body.checks.redis).toBeDefined();
    });
  });

  describe('GET /api/health/live', () => {
    it('should return 200 with ok status', async () => {
      const response = await request(baseURL).get('/api/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should not depend on external services', async () => {
      const response = await request(baseURL).get('/api/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body.checks).toBeUndefined();
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return 200 with status ok when all dependencies are ready', async () => {
      const response = await request(baseURL).get('/api/health/ready');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.checks?.db).toBeDefined();
      expect(response.body.checks?.redis).toBeDefined();
    });
  });

  describe('GET /api/health/db', () => {
    it('should return 200 with db status', async () => {
      const response = await request(baseURL).get('/api/health/db');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toMatch(/^(ok|error)$/);
    });
  });

  describe('GET /api/health/redis', () => {
    it('should return 200 with redis status', async () => {
      const response = await request(baseURL).get('/api/health/redis');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toMatch(/^(ok|error)$/);
    });
  });
});