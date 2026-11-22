import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { DataSource, type QueryRunner } from 'typeorm';
import { OfferEscrowBindings1763680000004 } from '../migrations/1763680000004-OfferEscrowBindings.js';
import { OfferEscrowBindingRepository } from './offer-escrow-binding.repository.js';

describe.skipIf(process.env.RUN_POSTGRES_INTEGRATION !== 'true')('offer binding persistence', () => {
  let db: DataSource;
  let schema: string;
  beforeAll(async () => {
    db = new DataSource({ type: 'postgres', host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'cobusiness', password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'cobusiness', extra: { max: 1 } });
    await db.initialize();
    schema = `offer_test_${randomUUID().replaceAll('-', '')}`;
    await db.query(`CREATE SCHEMA "${schema}"`);
    await db.query(`SET search_path TO "${schema}"`);
    await new OfferEscrowBindings1763680000004().up({ query: db.query.bind(db) } as unknown as QueryRunner);
  });
  afterAll(async () => { if (db?.isInitialized) { await db.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await db.destroy(); } });
  it('retains the binding and prohibits replacement or reuse of a contract', async () => {
    const repo = new OfferEscrowBindingRepository(db);
    const binding = { offerId: 'offer', contractId: 'contract', network: 'Test SDF Network ; September 2015', asset: 'asset', termsHash: 'ab'.repeat(32), wasmHash: 'cd'.repeat(32), termsXdr: Buffer.from('example') };
    await repo.insert(binding);
    expect(await repo.find('offer')).toEqual(binding);
    await expect(repo.insert({ ...binding, offerId: 'other' })).rejects.toThrow();
    await expect(db.query('UPDATE offer_escrow_bindings SET asset = $1 WHERE offer_id = $2', ['other', 'offer'])).rejects.toThrow();
    await expect(db.query('DELETE FROM offer_escrow_bindings WHERE offer_id = $1', ['offer'])).rejects.toThrow();
  });
  it('allows only one concurrent owner for the same contract across connections', async () => {
    const second = new DataSource({ type: 'postgres', host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'cobusiness', password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'cobusiness', extra: { max: 1 } });
    await second.initialize();
    try {
      await second.query(`SET search_path TO "${schema}"`);
      const binding = { offerId: 'race1', contractId: 'contract-race', network: 'Test SDF Network ; September 2015', asset: 'asset', termsHash: 'ab'.repeat(32), wasmHash: 'cd'.repeat(32), termsXdr: Buffer.from('example') };
      const results = await Promise.allSettled([new OfferEscrowBindingRepository(db).insert(binding), new OfferEscrowBindingRepository(second).insert({ ...binding, offerId: 'race2' })]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    } finally { await second.destroy(); }
  });
});
