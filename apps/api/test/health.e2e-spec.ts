import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/health should return 200 with ok when dependencies are healthy', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body.checks).toBeDefined();
  });

  it('GET /api/health/live should return 200 with ok', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('GET /api/health/live should not depend on external services', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200);
    
    expect(response.body.checks).toBeUndefined();
  });

  it('GET /api/health/ready should return 200 when ready', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/ready')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
  });

  it('GET /api/health/db should return 200 when db is healthy', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/db')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
  });

  it('GET /api/health/redis should return 200 when redis is healthy', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/redis')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
  });
});