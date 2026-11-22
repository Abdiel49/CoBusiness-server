import { describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import type { DemoStateStore } from '../../core/demo-state.store.js';
import type { OrdersService } from '../orders/orders.service.js';
import type { StellarSorobanClient } from './stellar-soroban.client.js';
import type { StellarAttestationClient } from './stellar-attestation.client.js';
import type { WalletBindingRepository } from '../../database/wallet-binding.repository.js';
import type { OfferEscrowBindingRepository } from '../../database/offer-escrow-binding.repository.js';

describe('offer verification before payment', () => {
  it('does not create a payment when RPC verification fails', async () => {
    const order = { id: 'order', lotId: 'lot', termsHash: 'a'.repeat(64), blockCount: 1, amountMinor: '10' };
    const state = { intents: new Map(), saveRecord: vi.fn() };
    const orders = { get: vi.fn().mockReturnValue(order) };
    const stellar = { assertEnabled: vi.fn() };
    const bindings = { find: vi.fn().mockResolvedValue({ termsHash: order.termsHash }) };
    const verifier = { verify: vi.fn().mockRejectedValue(new Error('RPC unavailable')) };
    const service = new PaymentsService(state as unknown as DemoStateStore, orders as unknown as OrdersService,
      stellar as unknown as StellarSorobanClient, {} as WalletBindingRepository,
      bindings as unknown as OfferEscrowBindingRepository, verifier as unknown as StellarAttestationClient);
    await expect(service.prepare({ id: 'buyer', role: 'buyer' }, 'order')).rejects.toThrow('RPC unavailable');
    expect(state.intents.size).toBe(0);
    expect(state.saveRecord).not.toHaveBeenCalled();
  });
});
