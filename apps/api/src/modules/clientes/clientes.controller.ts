import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@Controller('clientes')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@CurrentTenant() tenant: TenantContext) {
    return this.clientesService.list(tenant.tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.clientesService.getById(id, tenant.tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateClienteDto,
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: { sub: string },
  ) {
    return this.clientesService.create(dto, tenant.tenantId, user.sub);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.clientesService.update(id, dto, tenant.tenantId);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.clientesService.deactivate(id, tenant.tenantId);
  }
}