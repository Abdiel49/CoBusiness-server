import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import dataSource from '../data-source.js';
import { validateConfig } from '../config.js';
import { OfferEscrowBindingRepository } from '../database/offer-escrow-binding.repository.js';
import { escrowTermsHash, escrowTermsXdr, type EscrowTerms } from '../features/payments/escrow-terms.js';
import { ESCROW_V2_WASM_HASH, StellarAttestationClient } from '../features/payments/stellar-attestation.client.js';

async function main() {
  const path = process.argv[2];
  if (!path || process.argv.length !== 3) throw new Error('Usage: node dist/admin/register-offer-escrow.js <binding.json>');
  const raw: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid binding');
  const input = raw as Record<string, unknown>;
  if (typeof input.offerId !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(input.offerId) ||
      typeof input.contractId !== 'string' || !input.terms || typeof input.terms !== 'object') throw new Error('Invalid binding');
  if (input.offerId === 'lot-demo-001') throw new Error('The demo offer cannot be bound');
  const t = input.terms as Record<string, unknown>;
  if (typeof t.fundingDeadline !== 'string' || !/^[1-9][0-9]*$/.test(t.fundingDeadline)) throw new Error('Invalid funding deadline');
  const terms = { ...t, fundingDeadline: BigInt(t.fundingDeadline) } as unknown as EscrowTerms;
  const binding = { offerId: input.offerId, contractId: input.contractId,
    network: 'Test SDF Network ; September 2015', asset: terms.asset,
    termsHash: escrowTermsHash(terms), termsXdr: escrowTermsXdr(terms), wasmHash: ESCROW_V2_WASM_HASH };
  const verifier = new StellarAttestationClient(new ConfigService(validateConfig(process.env)));
  await verifier.verify(binding);
  await dataSource.initialize();
  try { await new OfferEscrowBindingRepository(dataSource).insert(binding); }
  finally { await dataSource.destroy(); }
  process.stdout.write(`Registered verified binding for ${binding.offerId}\n`);
}
main().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.message : 'Registration failed'}\n`); process.exitCode = 1; });
