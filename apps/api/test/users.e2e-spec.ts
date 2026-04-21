import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;
  const testTenantId = 'test-tenant-id';
  const testEmail = 'user@test.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'password123',
        name: 'Test User',
        tenantId: testTenantId,
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'password123',
        tenantId: testTenantId,
      });

    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/users', () => {
    it('should create user in current tenant', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          name: 'New User',
          role: 'USUARIO',
        })
        .expect(201);

      expect(response.body.email).toBe('newuser@test.com');
      expect(response.body.tenantId).toBe(testTenantId);
      expect(response.body.password).toBeUndefined();
      userId = response.body.id;
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'other@test.com',
          password: 'password123',
          name: 'Other User',
        })
        .expect(401);
    });
  });

  describe('GET /api/users', () => {
    it('should return only users from current tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      for (const user of response.body) {
        expect(user.tenantId).toBe(testTenantId);
      }
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user if belongs to tenant', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
    });

    it('should return 404 for user from different tenant', async () => {
      await request(app.getHttpServer())
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/users/:id/deactivate', () => {
    it('should deactivate user', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.active).toBe(false);
    });

    it('should return 404 for user not in tenant', async () => {
      await request(app.getHttpServer())
        .patch('/api/users/non-existent-id/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Cross-tenant isolation', () => {
    it('should not access user from different tenant', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'other@tenant.com',
          password: 'password123',
          name: 'Other Tenant User',
          tenantId: 'other-tenant-id',
        });

      const otherLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'other@tenant.com',
          password: 'password123',
          tenantId: 'other-tenant-id',
        });

      const otherToken = otherLogin.body.access_token;

      const response = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.status).toBe(404);
    });
  });
});