import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { DataSource, type QueryRunner } from 'typeorm';
import { AtomicOrders1763680000005 } from '../migrations/1763680000005-AtomicOrders.js';
import { ReservationRepository } from './reservation.repository.js';
import type { Order } from '../core/demo-state.store.js';

const enabled = process.env.RUN_POSTGRES_INTEGRATION === 'true';
describe.skipIf(!enabled)('atomic reservations in PostgreSQL', () => {
  let admin: DataSource, db: DataSource, repo: ReservationRepository, schema: string;
  const make = (buyer: string, key: string, blocks = 1): Order => ({ id: randomUUID(), lotId: 'lot', buyerId: buyer, blockCount: blocks, units: blocks, amountMinor: String(blocks), termsVersion: 1, termsHash: 'hash', idempotencyKey: key, status: 'pending', createdAt: new Date().toISOString() });
  const deadline = '2100-01-01T00:00:00Z';
  beforeAll(async () => {
    const options = { type: 'postgres' as const, host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'cobusiness', password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'cobusiness' };
    admin = new DataSource(options); await admin.initialize(); schema = 'reservations_' + randomUUID().replaceAll('-', '');
    await admin.query(`CREATE SCHEMA "${schema}"`);
    db = new DataSource({ ...options, extra: { max: 5, options: `-c search_path=${schema}` } }); await db.initialize();
    await db.query('CREATE TABLE domain_records (record_id text NOT NULL, kind text NOT NULL, payload jsonb NOT NULL)');
    const legacy = { ...make('legacy', 'legacy-key'), lotId: 'legacy-lot' };
    await db.query('INSERT INTO domain_records VALUES ($1, $2, $3::jsonb)', [legacy.id, 'order', JSON.stringify(legacy)]);
    await new AtomicOrders1763680000005().up({ query: db.query.bind(db) } as unknown as QueryRunner);
    repo = new ReservationRepository(db);
  });
  afterAll(async () => { if (db?.isInitialized) await db.destroy(); if (admin?.isInitialized) { await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await admin.destroy(); } });
  it('preserves legacy orders during migration', async () => { expect(await repo.reserved('legacy-lot')).toBe(1); expect(await repo.findByKey('legacy', 'legacy-key')).toMatchObject({ lotId: 'legacy-lot' }); });
  it('limits concurrent reservations and persists across repository instances', async () => {
    const results = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => repo.create(make(`buyer${i}`, 'key', 2), 6, deadline)));
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(3);
    expect(await new ReservationRepository(db).reserved('lot')).toBe(6);
  });
  it('returns a single order under concurrent retries and rejects conflicting input', async () => {
    const orders = await Promise.all(Array.from({ length: 5 }, () => repo.create({ ...make('same', 'retry'), lotId: 'other' }, 10, deadline)));
    expect(new Set(orders.map(o => o.id)).size).toBe(1);
    expect(await new ReservationRepository(db).find(orders[0].id)).toEqual(orders[0]);
    await expect(repo.create({ ...make('same', 'retry', 2), lotId: 'other' }, 10, deadline)).rejects.toMatchObject({ response: { code: 'IDEMPOTENCY_KEY_REUSED' } });
  });
  it('rejects expired reservations without inserting', async () => {
    await expect(repo.create({ ...make('late', 'key'), lotId: 'closed' }, 5, '2000-01-01T00:00:00Z')).rejects.toMatchObject({ response: { code: 'FUNDING_CLOSED' } });
    expect(await repo.reserved('closed')).toBe(0);
  });
});
