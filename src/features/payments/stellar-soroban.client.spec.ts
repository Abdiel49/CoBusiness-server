import { ConfigService } from '@nestjs/config';
import { StellarSorobanClient } from './stellar-soroban.client.js';

describe('Stellar offer configuration', () => {
  const configuredHash = 'ab'.repeat(32);
  const client = new StellarSorobanClient({
    get: (key: string) =>
      ({
        STELLAR_ENABLED: true,
        STELLAR_ESCROW_CONTRACT_ID: 'configured-contract',
        STELLAR_TERMS_HASH: configuredHash,
      })[key],
  } as unknown as ConfigService);

  it('rejects funding when the accepted offer terms differ from the configured contract terms', () => {
    expect(() => client.assertConfigured('cd'.repeat(32))).toThrowError(
      expect.objectContaining({
        response: expect.objectContaining({ code: 'STELLAR_OFFER_TERMS_MISMATCH' }),
      }),
    );
    expect(() => client.assertConfigured(configuredHash.toUpperCase())).toThrowError(
      expect.objectContaining({
        response: expect.objectContaining({ code: 'STELLAR_OFFER_NOT_VERIFIED' }),
      }),
    );
  });
});
