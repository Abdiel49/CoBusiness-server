import { createHash, timingSafeEqual } from 'node:crypto';
import type { OfferEscrowBinding } from '../../database/offer-escrow-binding.repository.js';

/** Evidence must come from the configured Testnet RPC, not user input. */
export type EscrowEvidence = {
  network: string;
  contractId: string;
  asset: string;
  termsHash: string;
  wasmHash: string;
};

export function matchesEscrowEvidence(binding: OfferEscrowBinding, evidence: EscrowEvidence, trustedWasmHash: string): boolean {
  const digest = createHash('sha256').update(binding.termsXdr).digest();
  if (!/^[0-9a-f]{64}$/.test(binding.termsHash)) return false;
  if (!timingSafeEqual(digest, Buffer.from(binding.termsHash, 'hex'))) return false;
  return binding.network === 'Test SDF Network ; September 2015' &&
    binding.network === evidence.network && binding.contractId === evidence.contractId &&
    binding.asset === evidence.asset && binding.termsHash === evidence.termsHash &&
    binding.wasmHash === trustedWasmHash && binding.wasmHash === evidence.wasmHash;
}
