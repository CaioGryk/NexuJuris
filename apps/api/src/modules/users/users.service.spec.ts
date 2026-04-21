import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return users scoped by tenant', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', name: 'User 1', password: 'hash', tenantId: 'tenant-1', role: 'USUARIO' },
        { id: '2', email: 'user2@test.com', name: 'User 2', password: 'hash', tenantId: 'tenant-1', role: 'USUARIO' },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any);

      const result = await service.list('tenant-1');

      expect(result.length).toBe(2);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return user if found in tenant', async () => {
      const mockUser = { id: '1', email: 'user1@test.com', name: 'User 1', password: 'hash', tenantId: 'tenant-1', role: 'USUARIO' };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser as any);

      const result = await service.getById('1', 'tenant-1');

      expect(result.email).toBe('user1@test.com');
    });

    it('should throw NotFoundException if user not in tenant', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(service.getById('1', 'tenant-1')).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('create', () => {
    it('should create user with hashed password in tenant', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: 'new-user',
        email: 'new@test.com',
        name: 'New User',
        password: 'hashed',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      const result = await service.create(
        { email: 'new@test.com', password: 'password123', name: 'New User' },
        'tenant-1',
      );

      expect(result.email).toBe('new@test.com');
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists in tenant', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'existing',
        email: 'existing@test.com',
      } as any);

      await expect(
        service.create(
          { email: 'existing@test.com', password: 'password123', name: 'Existing' },
          'tenant-1',
        ),
      ).rejects.toThrow('Email já está em uso neste tenant');
    });
  });

  describe('update', () => {
    it('should update user in tenant', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        id: '1',
        email: 'user1@test.com',
        name: 'User 1',
        password: 'hash',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: '1',
        email: 'user1@test.com',
        name: 'Updated Name',
        password: 'hash',
        tenantId: 'tenant-1',
        role: 'USUARIO',
      } as any);

      const result = await service.update('1', { name: 'Updated Name' }, 'tenant-1');

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if user not in tenant', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(service.update('1', { name: 'Updated' }, 'tenant-1')).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate user in tenant', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        id: '1',
        email: 'user1@test.com',
        name: 'User 1',
        password: 'hash',
        tenantId: 'tenant-1',
        role: 'USUARIO',
        active: true,
      } as any);

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: '1',
        email: 'user1@test.com',
        name: 'User 1',
        password: 'hash',
        tenantId: 'tenant-1',
        role: 'USUARIO',
        active: false,
      } as any);

      const result = await service.deactivate('1', 'tenant-1');

      expect(result.active).toBe(false);
    });

    it('should throw NotFoundException if user not in tenant', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(service.deactivate('1', 'tenant-1')).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw BadRequestException if already inactive', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        id: '1',
        active: false,
      } as any);

      await expect(service.deactivate('1', 'tenant-1')).rejects.toThrow('Usuário já está inativo');
    });
  });
});