import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  private toResponse(cliente: any): ClienteResponseDto {
    return cliente;
  }

  async list(tenantId: string) {
    const clientes = await this.prisma.cliente.findMany({
      where: { tenantId, active: true },
      orderBy: { createdAt: 'desc' },
    });
    return clientes.map((cliente) => this.toResponse(cliente));
  }

  async getById(id: string, tenantId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.toResponse(cliente);
  }

  async create(dto: CreateClienteDto, tenantId: string, userId: string) {
    const cliente = await this.prisma.cliente.create({
      data: {
        nome: dto.nome,
        whatsapp: dto.whatsapp,
        cpf: dto.cpf,
        email: dto.email,
        endereco: dto.endereco,
        observacoes: dto.observacoes,
        origem: dto.origem || 'manual',
        tenantId,
        userId,
        active: true,
      },
    });

    return this.toResponse(cliente);
  }

  async update(id: string, dto: UpdateClienteDto, tenantId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const updatedCliente = await this.prisma.cliente.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.endereco !== undefined && { endereco: dto.endereco }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
        ...(dto.origem !== undefined && { origem: dto.origem }),
      },
    });

    return this.toResponse(updatedCliente);
  }

  async deactivate(id: string, tenantId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (!cliente.active) {
      throw new BadRequestException('Cliente já está inativo');
    }

    const deactivatedCliente = await this.prisma.cliente.update({
      where: { id },
      data: { active: false },
    });

    return this.toResponse(deactivatedCliente);
  }
}