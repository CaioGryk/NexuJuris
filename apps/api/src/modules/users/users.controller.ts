import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@CurrentTenant() tenant: TenantContext) {
    return this.usersService.list(tenant.tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.getById(id, tenant.tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateUserDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.create(dto, tenant.tenantId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.update(id, dto, tenant.tenantId);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.deactivate(id, tenant.tenantId);
  }
}