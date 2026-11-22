import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { matchesEscrowEvidence } from './offer-attestation.js';

describe('escrow evidence', () => {
  it('requires the same contract, asset, terms, trusted WASM and network', () => {
    const termsXdr = Buffer.from('example');
    const binding = { offerId: 'offer', contractId: 'contract', asset: 'asset', network: 'Test SDF Network ; September 2015', termsHash: createHash('sha256').update(termsXdr).digest('hex'), wasmHash: 'ab'.repeat(32), termsXdr };
    const evidence = { ...binding };
    expect(matchesEscrowEvidence(binding, evidence, binding.wasmHash)).toBe(true);
    for (const field of ['network', 'contractId', 'asset', 'termsHash', 'wasmHash'] as const) {
      expect(matchesEscrowEvidence(binding, { ...evidence, [field]: 'wrong' }, binding.wasmHash)).toBe(false);
    }
    expect(matchesEscrowEvidence(binding, evidence, 'cd'.repeat(32))).toBe(false);
    expect(matchesEscrowEvidence({ ...binding, termsXdr: Buffer.from('other') }, evidence, binding.wasmHash)).toBe(false);
  });
});
