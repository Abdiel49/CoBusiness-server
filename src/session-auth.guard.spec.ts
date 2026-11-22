import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { RealAuthService } from './features/identity/real-auth.service.js';
import { SessionAuthGuard } from './session-auth.guard.js';

describe('session guard', () => {
  it('accepts only a server-validated session and attaches its actor', async () => {
    const authenticate = vi.fn().mockResolvedValue({ id: 'server-user', role: 'buyer' });
    const guard = new SessionAuthGuard({ authenticate } as unknown as RealAuthService);
    const req = { method: 'GET', headers: { cookie: '__Host-cobusiness_session=opaque', authorization: 'Bearer demo:admin-demo:admin' } };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(authenticate).toHaveBeenCalledWith('opaque');
    expect(req).toMatchObject({ actor: { id: 'server-user', role: 'buyer' } });
  });
  it('rejects demo bearer tokens and cross-origin mutations', async () => {
    const previous = process.env.CLIENT_ORIGIN;
    process.env.CLIENT_ORIGIN = 'https://app.example/';
    try {
      const guard = new SessionAuthGuard({ authenticate: vi.fn().mockResolvedValue(null) } as unknown as RealAuthService);
      const req = { method: 'GET', headers: { authorization: 'Bearer demo:admin-demo:admin' } };
      const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
      await expect(guard.canActivate(ctx)).rejects.toThrow();
      req.method = 'POST';
      await expect(guard.canActivate(ctx)).rejects.toThrow();
    } finally { if (previous === undefined) delete process.env.CLIENT_ORIGIN; else process.env.CLIENT_ORIGIN = previous; }
  });
});
