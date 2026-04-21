import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantContextGuard } from './tenant-context.guard';

describe('TenantContextGuard', () => {
  let guard: TenantContextGuard;

  const createMockContext = (user: unknown): { switchToHttp: () => { getRequest: () => { user: unknown; tenantContext?: unknown } } } => {
    const req = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextGuard],
    }).compile();

    guard = module.get<TenantContextGuard>(TenantContextGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request with valid user and tenantId and populate tenantContext', () => {
    const context = createMockContext({
      sub: 'user-id',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'USUARIO',
    });

    const http = context.switchToHttp();
    const req = http.getRequest();

    expect(guard.canActivate({ switchToHttp: () => http } as unknown as ExecutionContext)).toBe(true);
    expect(req.tenantContext).toEqual({
      tenantId: 'tenant-1',
      role: 'USUARIO',
      userId: 'user-id',
    });
  });

  it('should throw UnauthorizedException when user is missing', () => {
    const context = createMockContext(undefined);

    expect(() => guard.canActivate({ switchToHttp: () => context.switchToHttp() } as unknown as ExecutionContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when tenantId is missing', () => {
    const context = createMockContext({
      sub: 'user-id',
      email: 'test@example.com',
      tenantId: undefined,
      role: 'USUARIO',
    });

    expect(() => guard.canActivate({ switchToHttp: () => context.switchToHttp() } as unknown as ExecutionContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when tenantId is empty', () => {
    const context = createMockContext({
      sub: 'user-id',
      email: 'test@example.com',
      tenantId: '',
      role: 'USUARIO',
    });

    expect(() => guard.canActivate({ switchToHttp: () => context.switchToHttp() } as unknown as ExecutionContext)).toThrow(UnauthorizedException);
  });
});