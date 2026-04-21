import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../interfaces/tenant-context.interface';

export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext): TenantContext | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    if (!tenantContext?.tenantId) {
      return undefined;
    }

    return data ? tenantContext[data] : tenantContext;
  },
);