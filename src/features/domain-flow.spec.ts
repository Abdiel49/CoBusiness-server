import { DemoStateStore } from '../core/demo-state.store.js';
import { DomainRecordRepository } from '../database/domain-record.repository.js';
import { CatalogService } from './catalog/catalog.service.js';
import { OrdersService } from './orders/orders.service.js';
import { AuditService } from './audit/audit.service.js';
import { IndexerService } from './indexer/indexer.service.js';
import { ApprovalsService } from './approvals/approvals.service.js';

describe('MVP feature services', () => {
  let state: DemoStateStore;
  let catalog: CatalogService;
  let orders: OrdersService;
  let audit: AuditService;
  let indexer: IndexerService;
  let approvals: ApprovalsService;
  const buyer = { id: 'buyer-demo', role: 'buyer' as const };
  const repository = {
    save: vi.fn(),
    remove: vi.fn(),
    findAll: vi.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    state = new DemoStateStore(repository as unknown as DomainRecordRepository);
    catalog = new CatalogService(state);
    orders = new OrdersService(state);
    audit = new AuditService(state, catalog);
    indexer = new IndexerService(state, audit);
    approvals = new ApprovalsService(state, indexer, orders, audit);
  });

  it('creates whole-block orders idempotently with exact amounts and a frozen terms hash', async () => {
    const input = {
      blockCount: 2,
      acceptedTermsVersion: 1,
      idempotencyKey: 'checkout-1',
    };
    const first = await orders.create(buyer, input);
    const retry = await orders.create(buyer, input);

    expect(retry.id).toBe(first.id);
    expect(first.units).toBe(20);
    expect(first.amountMinor).toBe('25000000');
    expect(first.termsHash).toBe(state.lot.termsHash);
    expect(first.receipt.paymentStatus).toBe('pending');
    expect(catalog.lotView().blocksAvailable).toBe(18);
    expect(catalog.lotView().confirmedAmountMinor).toBe('0');
  });

  it('rejects stale terms, key reuse with different data, and excess capacity', async () => {
    await expect(
      orders.create(buyer, {
        blockCount: 1,
        acceptedTermsVersion: 2,
        idempotencyKey: 'stale',
      }),
    ).rejects.toMatchObject({ response: { code: 'TERMS_VERSION_MISMATCH' } });
    await orders.create(buyer, {
      blockCount: 1,
      acceptedTermsVersion: 1,
      idempotencyKey: 'duplicate-key',
    });
    await expect(
      orders.create(buyer, {
        blockCount: 2,
        acceptedTermsVersion: 1,
        idempotencyKey: 'duplicate-key',
      }),
    ).rejects.toMatchObject({ response: { code: 'IDEMPOTENCY_KEY_REUSED' } });
    await expect(
      orders.create(buyer, {
        blockCount: 21,
        acceptedTermsVersion: 1,
        idempotencyKey: 'too-many',
      }),
    ).rejects.toMatchObject({ response: { code: 'LOT_CAPACITY_EXCEEDED' } });
  });

  it('applies only confirmed chain events and deduplicates canonical event identities', async () => {
    const event = {
      network: 'Test SDF Network ; September 2015',
      contractId: 'UNCONFIGURED',
      type: 'funded' as const,
      lotId: 'lot-demo-001',
      amountMinor: '12500000',
      txHash: 'fixture-tx-1',
      ledger: 42,
      confirmed: false,
    };
    expect(await indexer.ingest(event)).toMatchObject({ accepted: false });
    expect(catalog.lotView().confirmedAmountMinor).toBe('0');
    expect(await indexer.ingest({ ...event, confirmed: true })).toMatchObject({
      accepted: true,
      duplicate: false,
    });
    expect(await indexer.ingest({ ...event, confirmed: true })).toMatchObject({
      accepted: true,
      duplicate: true,
    });
    expect(catalog.lotView().confirmedAmountMinor).toBe('12500000');
  });

  it('requires operator response and CoBusiness role before preparing release', async () => {
    await indexer.ingest({
      network: 'Test SDF Network ; September 2015',
      contractId: 'UNCONFIGURED',
      type: 'funded',
      lotId: 'lot-demo-001',
      amountMinor: '250000000',
      txHash: 'fixture-goal',
      ledger: 43,
      confirmed: true,
    });
    await expect(
      approvals.prepareRelease({ id: 'cobusiness-demo', role: 'cobusiness' }),
    ).rejects.toMatchObject({ response: { code: 'RELEASE_NOT_ELIGIBLE' } });
    await approvals.respond(
      { id: 'operator-demo', role: 'operator' },
      'continue',
    );
    await expect(
      approvals.prepareRelease({ id: 'buyer-demo', role: 'buyer' }),
    ).rejects.toMatchObject({ response: { code: 'FORBIDDEN' } });
    const prepared = await approvals.prepareRelease({
      id: 'cobusiness-demo',
      role: 'cobusiness',
    });
    expect(prepared).toMatchObject({
      status: 'prepared',
      signed: false,
      contractId: 'UNCONFIGURED',
    });
    expect(indexer.escrow().confirmed.releasedAmountMinor).toBe('0');
  });

  it('separates refund preparation from on-chain enablement and makes claims repeatable', async () => {
    const order = await orders.create(buyer, {
      blockCount: 20,
      acceptedTermsVersion: 1,
      idempotencyKey: 'refund-order',
    });
    await indexer.ingest({
      network: 'Test SDF Network ; September 2015',
      contractId: 'UNCONFIGURED',
      type: 'funded',
      lotId: 'lot-demo-001',
      orderId: order.id,
      amountMinor: order.amountMinor,
      txHash: 'fixture-refund-goal',
      ledger: 44,
      confirmed: true,
    });
    await approvals.respond(
      { id: 'operator-demo', role: 'operator' },
      'decline',
    );
    expect(
      await approvals.prepareRefundEnablement({
        id: 'cobusiness-demo',
        role: 'cobusiness',
      }),
    ).toMatchObject({ eligible: true, enabled: false, status: 'prepared' });
    await expect(approvals.prepareClaim(buyer, order.id)).rejects.toMatchObject(
      { response: { code: 'REFUND_NOT_ENABLED' } },
    );
    await indexer.ingest({
      network: 'Test SDF Network ; September 2015',
      contractId: 'UNCONFIGURED',
      type: 'refund_enabled',
      lotId: 'lot-demo-001',
      amountMinor: '0',
      txHash: 'fixture-refund-enabled',
      ledger: 45,
      confirmed: true,
    });
    const claim = await approvals.prepareClaim(buyer, order.id);
    const retry = await approvals.prepareClaim(buyer, order.id);
    expect(claim).toMatchObject({
      enabled: true,
      status: 'prepared',
      signed: false,
    });
    expect(retry.claimId).toBe(claim.claimId);
  });

});
