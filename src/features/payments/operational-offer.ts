import { scValToNative, xdr } from '@stellar/stellar-sdk';
import type { OfferEscrowBinding } from '../../database/offer-escrow-binding.repository.js';

export function operationalOffer(binding: OfferEscrowBinding) {
  const terms = scValToNative(xdr.ScVal.fromXdr(binding.termsXdr)) as { config: Record<string, unknown> };
  const config = terms.config;
  const deadline = Number(config.funding_deadline);
  if (!Number.isSafeInteger(deadline) || deadline <= 0 || deadline > 8_640_000_000) throw new Error('Invalid funding deadline');
  return { id: binding.offerId, contractId: binding.contractId, asset: binding.asset,
    unitsPerBlock: Number(config.units_per_block), totalBlocks: Number(config.total_blocks),
    blockPriceMinor: String(config.block_price_minor), fundingDeadline: new Date(deadline * 1000).toISOString(),
    termsVersion: 1, termsHash: binding.termsHash };
}
