import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { rpc, scValToNative } from '@stellar/stellar-sdk';
import { escrowTermsHash, escrowTermsXdr } from './escrow-terms.js';
import type { OfferEscrowBinding } from '../../database/offer-escrow-binding.repository.js';
import { matchesEscrowEvidence } from './offer-attestation.js';

// The checked-in escrow-v2 release checksum; never derive trust from administrator input.
export const ESCROW_V2_WASM_HASH = '08f9959ef97ea8a8bff3899305b9341aa7f1c43fa05a4fe8883990034d2b3671';
const TESTNET = 'Test SDF Network ; September 2015';

@Injectable()
export class StellarAttestationClient {
  constructor(private readonly config: ConfigService) {}

  async verify(binding: OfferEscrowBinding): Promise<void> {
    try {
      const url = this.config.getOrThrow<string>('STELLAR_RPC_URL');
      const server = new rpc.Server(url);
      const network = await server.getNetwork();
      if (network.passphrase !== TESTNET) throw new Error('Unexpected network');
      const instance = await server.getContractInstance(binding.contractId);
      if (instance.executable.type !== 'contractExecutableWasm') throw new Error('Not a WASM contract');
      const wasmHash = Buffer.from(instance.executable.wasmHash.value).toString('hex');
      const wasm = await server.getContractWasmByHash(wasmHash, 'hex');
      if (createHash('sha256').update(wasm).digest('hex') !== wasmHash) throw new Error('WASM content mismatch');
      const lotEntry = instance.storage?.find((entry) => {
        const key: unknown = scValToNative(entry.key);
        return Array.isArray(key) && key.length === 1 && key[0] === 'Lot';
      });
      if (!lotEntry) throw new Error('Missing contract lot');
      const lot = scValToNative(lotEntry.val) as { config: Record<string, unknown>; terms_hash: Uint8Array };
      const c = lot.config;
      const terms = { chainLotId: Buffer.from(c.chain_lot_id as Uint8Array).toString('hex'),
        authority: String(c.authority), operator: String(c.operator), asset: String(c.asset),
        unitsPerBlock: Number(c.units_per_block), totalBlocks: Number(c.total_blocks),
        blockPriceMinor: String(c.block_price_minor), fundingDeadline: BigInt(String(c.funding_deadline)) };
      const termsHash = Buffer.from(lot.terms_hash).toString('hex');
      if (escrowTermsHash(terms) !== termsHash || !escrowTermsXdr(terms).equals(binding.termsXdr) ||
          !matchesEscrowEvidence(binding, { network: network.passphrase, contractId: binding.contractId,
            asset: terms.asset, termsHash, wasmHash }, ESCROW_V2_WASM_HASH)) throw new Error('Escrow evidence mismatch');
    } catch (cause) {
      throw new ServiceUnavailableException({ code: 'STELLAR_OFFER_NOT_VERIFIED', message: 'Offer deployment verification failed' }, { cause });
    }
  }
}
