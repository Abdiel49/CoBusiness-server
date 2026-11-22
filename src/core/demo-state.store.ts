import { Injectable, OnModuleInit } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DomainRecordRepository } from '../database/domain-record.repository.js';

export type DemoRole = 'buyer' | 'operator' | 'cobusiness' | 'admin';
export type Actor = { id: string; role: DemoRole };
export type Order = {
  id: string;
  lotId: string;
  buyerId: string;
  blockCount: number;
  units: number;
  amountMinor: string;
  termsVersion: number;
  termsHash: string;
  assetContractId?: string;
  idempotencyKey: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
};
export type Intent = {
  id: string;
  orderId: string;
  status: 'prepared' | 'submitted' | 'confirmed' | 'failed';
  amountMinor: string;
  orderRef: string;
  preparedXdr?: string;
  preparedTxHash?: string;
  contractId?: string;
  networkPassphrase?: string;
  acceptedTermsHash?: string;
  txHash?: string;
  createdAt: string;
};
export type ChainEvent = {
  id: string;
  network: string;
  contractId: string;
  type: 'funded' | 'released' | 'refund_enabled' | 'refunded';
  lotId: string;
  orderId?: string;
  amountMinor: string;
  txHash: string;
  ledger: number;
  confirmed: boolean;
  createdAt: string;
};

@Injectable()
export class DemoStateStore implements OnModuleInit {
  readonly operator = {
    id: 'operator-demo',
    name: 'Andes Harvest Cooperative',
    reviewStatus: 'simulated',
    delivery: {
      method: 'pickup',
      location: 'La Paz, Bolivia',
      estimatedDays: 14,
    },
    knownCosts: [
      { label: 'Consolidation', amountMinor: '250000', asset: 'USDC' },
    ],
  };
  readonly product = {
    id: 'coffee-001',
    sku: 'DEMO-COFFEE-001',
    name: 'Bolivian specialty coffee',
    description: 'Fictional MVP offer for demonstration only.',
    asset: {
      code: 'USDC',
      issuer: 'GDEMOUSDCISSUER0000000000000000000000000000000000000000',
      decimals: 7,
    },
    unitName: 'kg',
    unitPriceMinor: '1250000',
  };
  readonly lot = {
    id: 'lot-demo-001',
    operatorId: 'operator-demo',
    productId: 'coffee-001',
    status: 'open' as 'open' | 'goal_reached' | 'closed',
    escrowStatus: 'unfunded' as
      'unfunded' | 'funding' | 'funded' | 'released' | 'refunded',
    unitsPerBlock: 10,
    totalBlocks: 20,
    blockPriceMinor: '12500000',
    asset: this.product.asset,
    fundingDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    termsVersion: 1,
    terms: {
      deliveryDays: 14,
      deliveryMethod: 'pickup',
      refundCause: 'funding_deadline_missed',
      responseWindowHours: 24,
    },
    termsHash: '',
    blocksFunded: 0,
    goalReachedAt: null as string | null,
    operatorResponse: null as {
      decision: 'continue' | 'decline';
      source: string;
      respondedAt: string;
    } | null,
    releaseAuthorization: null as unknown,
    refundEnabled: false,
  };
  readonly orders = new Map<string, Order>();
  readonly idempotency = new Map<string, string>();
  readonly intents = new Map<string, Intent>();
  readonly events = new Map<string, ChainEvent>();
  readonly challenges = new Map<
    string,
    { userId: string; nonce: string; expiresAt: number; network: string }
  >();
  readonly wallets = new Map<string, string>();
  readonly walletOwners = new Map<string, string>();
  readonly claimPreparations = new Map<string, Record<string, unknown>>();
  readonly audit: Array<Record<string, unknown>> = [];
  readonly syncErrors: Array<Record<string, unknown>> = [];

  constructor(private readonly records: DomainRecordRepository) {
    this.lot.termsHash = createHash('sha256')
      .update(JSON.stringify(this.lot.terms))
      .digest('hex');
  }

  async onModuleInit() {
    const rows = await this.records.findAll();
    for (const row of rows) {
      if (row.kind === 'lot') Object.assign(this.lot, row.payload);
      if (row.kind === 'order')
        this.orders.set(row.recordId, row.payload as Order);
      if (row.kind === 'idempotency')
        this.idempotency.set(row.recordId, String(row.payload.orderId));
      if (row.kind === 'intent')
        this.intents.set(row.recordId, row.payload as Intent);
      if (row.kind === 'event')
        this.events.set(row.recordId, row.payload as ChainEvent);
      if (row.kind === 'wallet')
        this.wallets.set(row.recordId, String(row.payload.publicKey));
      if (row.kind === 'wallet-public-key')
        this.walletOwners.set(row.recordId, String(row.payload.userId));
      if (row.kind === 'refund_claim')
        this.claimPreparations.set(row.recordId, row.payload);
      if (row.kind === 'challenge')
        this.challenges.set(
          row.recordId,
          row.payload as {
            userId: string;
            nonce: string;
            expiresAt: number;
            network: string;
          },
        );
      if (row.kind === 'audit') this.audit.push(row.payload);
    }
    if (!rows.some((row) => row.kind === 'lot' && row.recordId === this.lot.id))
      await this.saveRecord('lot', this.lot.id, this.lot);
  }

  async saveRecord(kind: string, recordId: string, payload: object) {
    await this.records.save(kind, recordId, payload);
  }

  async removeRecord(kind: string, recordId: string) {
    await this.records.remove(kind, recordId);
  }
}
