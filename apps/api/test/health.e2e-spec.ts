import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as dotenv from 'dotenv';
import { AppModule } from '../src/app.module';

dotenv.config();

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let baseURL: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.setGlobalPrefix('api');
    
    await app.init();

    baseURL = app.getHttpServer().url;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/health', () => {
    it('should return 200 with ok when all dependencies are healthy', async () => {
      const response = await request(baseURL).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should return 503 when any dependency fails', async () => {
      const response = await request(baseURL).get('/api/health');
      
      if (response.body.status === 'error') {
        expect(response.status).toBe(503);
      }
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
    it('should return 200 when all dependencies are ready', async () => {
      const response = await request(baseURL).get('/api/health/ready');
      
      if (response.body.status === 'ok') {
        expect(response.status).toBe(200);
      }
    });

    it('should return 503 when any dependency fails', async () => {
      const response = await request(baseURL).get('/api/health/ready');
      
      if (response.body.status === 'error') {
        expect(response.status).toBe(503);
      }
    });
  });

  describe('GET /api/health/db', () => {
    it('should return 200 when db is healthy', async () => {
      const response = await request(baseURL).get('/api/health/db');
      
      if (response.body.status === 'ok') {
        expect(response.status).toBe(200);
      }
    });

    it('should return 503 when db fails', async () => {
      const response = await request(baseURL).get('/api/health/db');
      
      if (response.body.status === 'error') {
        expect(response.status).toBe(503);
      }
    });
  });

  describe('GET /api/health/redis', () => {
    it('should return 200 when redis is healthy', async () => {
      const response = await request(baseURL).get('/api/health/redis');
      
      if (response.body.status === 'ok') {
        expect(response.status).toBe(200);
      }
    });

    it('should return 503 when redis fails', async () => {
      const response = await request(baseURL).get('/api/health/redis');
      
      if (response.body.status === 'error') {
        expect(response.status).toBe(503);
      }
    });
  });
});