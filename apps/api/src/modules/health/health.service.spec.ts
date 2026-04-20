import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    service = new HealthService({} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return ok status', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});