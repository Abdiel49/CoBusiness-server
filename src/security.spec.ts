import { ExecutionContext } from '@nestjs/common';
import { DemoAuthGuard } from './security.js';
import { IdentityService } from './features/identity/identity.service.js';
import { DemoStateStore } from './core/demo-state.store.js';

describe('demo authentication', () => {
  const previous = process.env.NODE_ENV;
  afterEach(() => { process.env.NODE_ENV = previous; });

  it('rejects predictable demo tokens and does not issue them in production', () => {
    process.env.NODE_ENV = 'production';
    const context = { switchToHttp: () => ({ getRequest: () => ({
      headers: { authorization: 'Bearer demo:admin-demo:admin' },
    }) }) } as unknown as ExecutionContext;
    expect(() => new DemoAuthGuard().canActivate(context)).toThrow();
    expect(() => new IdentityService({} as DemoStateStore).login('admin-demo')).toThrow();
  });
});
