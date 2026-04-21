import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private toResponse(user: any): UserResponseDto {
    const { password, ...result } = user;
    return result;
  }

  async list(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.toResponse(user));
  }

  async getById(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.toResponse(user);
  }

  async create(dto: CreateUserDto, tenantId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso neste tenant');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        tenantId,
        role: dto.role || UserRole.USUARIO,
        phone: dto.phone,
        oab: dto.oab,
      },
    });

    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.role && { role: dto.role }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.oab !== undefined && { oab: dto.oab }),
      },
    });

    return this.toResponse(updatedUser);
  }

  async deactivate(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.active) {
      throw new BadRequestException('Usuário já está inativo');
    }

    const deactivatedUser = await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return this.toResponse(deactivatedUser);
  }
}