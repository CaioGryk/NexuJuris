import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!user.tenantId) {
      throw new UnauthorizedException('Contexto de tenant não encontrado');
    }

    request.tenantContext = {
      tenantId: user.tenantId,
      role: user.role,
      userId: user.sub,
    };

    return true;
  }
}