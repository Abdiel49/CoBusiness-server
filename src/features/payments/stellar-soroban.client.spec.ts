import { ConfigService } from '@nestjs/config';
import { StellarSorobanClient } from './stellar-soroban.client.js';

describe('Stellar funding configuration', () => {
  it('rejects funding if integration is disabled', () => {
    const client = new StellarSorobanClient({ get: () => false } as unknown as ConfigService);
    expect(() => client.assertEnabled()).toThrowError(expect.objectContaining({
      response: expect.objectContaining({ code: 'STELLAR_INTEGRATION_NOT_CONFIGURED' }),
    }));
  });
});
