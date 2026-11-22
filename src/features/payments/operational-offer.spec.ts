import { expect, it, vi } from 'vitest';
import { escrowTermsHash, escrowTermsXdr } from './escrow-terms.js';
import { operationalOffer } from './operational-offer.js';
import { DemoStateStore } from '../../core/demo-state.store.js';
import { OrdersService } from '../orders/orders.service.js';
import type { DomainRecordRepository } from '../../database/domain-record.repository.js';
import type { ReservationRepository } from '../../database/reservation.repository.js';
import type { OfferEscrowBindingRepository } from '../../database/offer-escrow-binding.repository.js';

it('creates orders with the operational offer canonical terms and price', async () => {
  const terms = { chainLotId: '01'.repeat(32), authority: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM', operator: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFCT4', asset: 'CACMVW2KK4H5FZDFF2AUCAKQTEJMZZWJUIZF23XMRVYQBSXYLHZ6BKWN', unitsPerBlock: 100, totalBlocks: 10, blockPriceMinor: '10000000', fundingDeadline: 4102444800n };
  const binding = { offerId: 'offer-live', contractId: 'contract', network: 'Test SDF Network ; September 2015', asset: terms.asset, termsHash: escrowTermsHash(terms), termsXdr: escrowTermsXdr(terms), wasmHash: 'aa'.repeat(32) };
  expect(operationalOffer(binding)).toMatchObject({ id: 'offer-live', termsHash: binding.termsHash, blockPriceMinor: '10000000' });
  const state = new DemoStateStore({ save: vi.fn() } as unknown as DomainRecordRepository);
  const orders = new OrdersService(state, { findByKey: vi.fn().mockResolvedValue(null), create: vi.fn().mockImplementation(async (order) => order) } as unknown as ReservationRepository, { find: vi.fn().mockResolvedValue(binding) } as unknown as OfferEscrowBindingRepository);
  const result = await orders.create({ id: 'buyer', role: 'buyer' }, { lotId: binding.offerId, blockCount: 2, acceptedTermsVersion: 1, idempotencyKey: 'key' });
  expect(result).toMatchObject({ lotId: 'offer-live', termsHash: binding.termsHash, amountMinor: '20000000', receipt: { asset: terms.asset } });
});
