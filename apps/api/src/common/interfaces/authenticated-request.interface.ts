import { TenantContext } from './tenant-context.interface';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        tenantId: string;
        role: string;
      };
      tenantContext?: TenantContext;
    }
  }
}