import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('ClientesService', () => {
  let service: ClientesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      cliente: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return active clients scoped by tenant', async () => {
      const mockClientes = [
        { id: '1', nome: 'Cliente 1', tenantId: 'tenant-1', active: true },
        { id: '2', nome: 'Cliente 2', tenantId: 'tenant-1', active: true },
      ];

      jest.spyOn(prismaService.cliente, 'findMany').mockResolvedValue(mockClientes as any);

      const result = await service.list('tenant-1');

      expect(result.length).toBe(2);
      expect(prismaService.cliente.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', active: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return cliente if found in tenant', async () => {
      const mockCliente = { id: '1', nome: 'Cliente 1', tenantId: 'tenant-1', active: true };

      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(mockCliente as any);

      const result = await service.getById('1', 'tenant-1');

      expect(result.nome).toBe('Cliente 1');
    });

    it('should throw NotFoundException if cliente not in tenant', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(null);

      await expect(service.getById('1', 'tenant-1')).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('create', () => {
    it('should create cliente with tenantId and userId', async () => {
      jest.spyOn(prismaService.cliente, 'create').mockResolvedValue({
        id: 'new-cliente',
        nome: 'Novo Cliente',
        tenantId: 'tenant-1',
        userId: 'user-1',
        active: true,
      } as any);

      const result = await service.create(
        { nome: 'Novo Cliente' },
        'tenant-1',
        'user-1',
      );

      expect(result.nome).toBe('Novo Cliente');
      expect(prismaService.cliente.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update cliente in tenant', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue({
        id: '1',
        nome: 'Cliente 1',
        tenantId: 'tenant-1',
        active: true,
      } as any);

      jest.spyOn(prismaService.cliente, 'update').mockResolvedValue({
        id: '1',
        nome: 'Cliente Atualizado',
        tenantId: 'tenant-1',
        active: true,
      } as any);

      const result = await service.update('1', { nome: 'Cliente Atualizado' }, 'tenant-1');

      expect(result.nome).toBe('Cliente Atualizado');
    });

    it('should throw NotFoundException if cliente not in tenant', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(null);

      await expect(service.update('1', { nome: 'Updated' }, 'tenant-1')).rejects.toThrow(
        'Cliente não encontrado',
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate cliente in tenant', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue({
        id: '1',
        nome: 'Cliente 1',
        tenantId: 'tenant-1',
        active: true,
      } as any);

      jest.spyOn(prismaService.cliente, 'update').mockResolvedValue({
        id: '1',
        nome: 'Cliente 1',
        tenantId: 'tenant-1',
        active: false,
      } as any);

      const result = await service.deactivate('1', 'tenant-1');

      expect(result.active).toBe(false);
    });

    it('should throw NotFoundException if cliente not in tenant', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(null);

      await expect(service.deactivate('1', 'tenant-1')).rejects.toThrow('Cliente não encontrado');
    });

    it('should throw BadRequestException if already inactive', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue({
        id: '1',
        active: false,
      } as any);

      await expect(service.deactivate('1', 'tenant-1')).rejects.toThrow('Cliente já está inativo');
    });
  });
});