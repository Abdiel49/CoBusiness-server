import { createHash } from 'node:crypto';
import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';

/** The immutable escrow-v2 constructor terms, in the contract's native units. */
export type EscrowTerms = {
  chainLotId: string;
  authority: string;
  operator: string;
  asset: string;
  unitsPerBlock: number;
  totalBlocks: number;
  blockPriceMinor: string;
  fundingDeadline: bigint;
};

const symbol = (value: string) => nativeToScVal(value, { type: 'symbol' });
const map = (entries: [string, xdr.ScVal][]) =>
  xdr.ScVal.scvMap(
    entries.map(([key, val]) => new xdr.ScMapEntry({ key: symbol(key), val })),
  );

/** Serialize exactly as the Soroban contract's Terms::to_xdr, not JSON. */
export function escrowTermsXdr(terms: EscrowTerms): Buffer {
  if (!/^[0-9a-f]{64}$/i.test(terms.chainLotId))
    throw new Error('chainLotId must be 32 bytes in hexadecimal');
  if (
    !Number.isInteger(terms.unitsPerBlock) || terms.unitsPerBlock <= 0 ||
    terms.unitsPerBlock > 0xffffffff || !Number.isInteger(terms.totalBlocks) ||
    terms.totalBlocks <= 0 || terms.totalBlocks > 0xffffffff ||
    !/^[1-9][0-9]*$/.test(terms.blockPriceMinor) || terms.fundingDeadline <= 0n
  ) throw new Error('Invalid escrow terms');

  const config = map([
    ['asset', new Address(terms.asset).toScVal()],
    ['authority', new Address(terms.authority).toScVal()],
    ['block_price_minor', nativeToScVal(BigInt(terms.blockPriceMinor), { type: 'i128' })],
    ['chain_lot_id', xdr.ScVal.scvBytes(Buffer.from(terms.chainLotId, 'hex'))],
    ['funding_deadline', nativeToScVal(terms.fundingDeadline, { type: 'u64' })],
    ['operator', new Address(terms.operator).toScVal()],
    ['total_blocks', nativeToScVal(terms.totalBlocks, { type: 'u32' })],
    ['units_per_block', nativeToScVal(terms.unitsPerBlock, { type: 'u32' })],
  ]);
  return Buffer.from(map([
    ['config', config],
    ['fee_bps', nativeToScVal(0, { type: 'u32' })],
    ['refund_policy', symbol('funding_or_approval_expired')],
    ['response_window', nativeToScVal(86400n, { type: 'u64' })],
    ['schema', symbol('escrow_terms_v2')],
  ]).toXDR());
}

export function escrowTermsHash(terms: EscrowTerms): string {
  return createHash('sha256').update(escrowTermsXdr(terms)).digest('hex');
}
