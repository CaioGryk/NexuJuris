import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwt = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
      verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@example.com', tenantId: 'tenant-1', role: 'USUARIO' }),
    };

    const mockConfig = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      const result = await service.login({ email: 'test@example.com', password: 'password123', tenantId: 'tenant-1' });

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('should throw error on user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'password123', tenantId: 'tenant-1' }),
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword', tenantId: 'tenant-1' }),
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('register', () => {
    it('should create new user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        password: 'hashed',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-1',
      });

      expect(result.email).toBe('new@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should throw error if tenantId is missing', async () => {
      await expect(
        service.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          tenantId: '',
        }),
      ).rejects.toThrow('tenantId é obrigatório para registro');
    });

    it('should throw error if email exists in tenant', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
        tenantId: 'tenant-1',
      } as any);

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow('Email já está em uso neste tenant');
    });
  });

  describe('refreshToken', () => {
    it('should return new access token', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.access_token).toBeDefined();
    });
  });
});