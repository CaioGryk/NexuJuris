import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ClientesController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let clienteId: string;
  const testTenantId = 'test-tenant-id';
  const testEmail = 'cliente-test@test.com';

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
        name: 'Cliente User',
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

  describe('POST /api/clientes', () => {
    it('should create cliente in current tenant', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Novo Cliente',
          whatsapp: '+5511999999999',
          email: 'teste@cliente.com',
        })
        .expect(201);

      expect(response.body.nome).toBe('Novo Cliente');
      expect(response.body.tenantId).toBe(testTenantId);
      expect(response.body.userId).toBeDefined();
      clienteId = response.body.id;
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/clientes')
        .send({
          nome: 'Outro Cliente',
        })
        .expect(401);
    });
  });

  describe('GET /api/clientes', () => {
    it('should return only clientes from current tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      for (const cliente of response.body) {
        expect(cliente.tenantId).toBe(testTenantId);
      }
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/clientes')
        .expect(401);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('should return cliente if belongs to tenant', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.id).toBe(clienteId);
    });

    it('should return 404 for cliente from different tenant', async () => {
      await request(app.getHttpServer())
        .get('/api/clientes/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/clientes/:id', () => {
    it('should update cliente', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Cliente Atualizado',
        })
        .expect(200);

      expect(response.body.nome).toBe('Cliente Atualizado');
    });

    it('should return 404 for cliente not in tenant', async () => {
      await request(app.getHttpServer())
        .patch('/api/clientes/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Updated',
        })
        .expect(404);
    });
  });

  describe('PATCH /api/clientes/:id/deactivate', () => {
    it('should deactivate cliente', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/clientes/${clienteId}/deactivate`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.active).toBe(false);
    });

    it('should return 404 for cliente not in tenant', async () => {
      await request(app.getHttpServer())
        .patch('/api/clientes/non-existent-id/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Cross-tenant isolation', () => {
    it('should not access cliente from different tenant', async () => {
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
        .get(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.status).toBe(404);
    });
  });
});