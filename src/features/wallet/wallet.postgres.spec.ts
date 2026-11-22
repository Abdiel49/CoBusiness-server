import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHash, randomUUID } from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { DataSource, type QueryRunner } from 'typeorm';
import { WalletBindingRepository } from '../../database/wallet-binding.repository.js';
import { CreateWalletBindings1763680000001 } from '../../migrations/1763680000001-CreateWalletBindings.js';
import { StellarWalletProofVerifier } from '../../wallet-proof.js';
import { WalletService } from './wallet.service.js';
import { IdentityService } from '../identity/identity.service.js';

describe.skipIf(process.env.RUN_POSTGRES_INTEGRATION !== 'true')('wallet PostgreSQL', () => {
  let db: DataSource, admin: DataSource, wallet: WalletService, repo: WalletBindingRepository, schema: string;
  const buyer = { id: 'one', role: 'buyer' as const }, other = { id: 'two', role: 'buyer' as const };
  const keys = Keypair.random();
  beforeAll(async () => {
    const options = { type: 'postgres' as const, host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'cobusiness', password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'cobusiness' };
    admin = new DataSource(options); await admin.initialize();
    schema = 'wallet_test_' + randomUUID().replaceAll('-', '');
    await admin.query(`CREATE SCHEMA "${schema}"`);
    db = new DataSource({ ...options, extra: { max: 5, options: `-c search_path=${schema}` } }); await db.initialize();
    await new CreateWalletBindings1763680000001().up({ query: db.query.bind(db) } as unknown as QueryRunner);
    repo = new WalletBindingRepository(db); wallet = new WalletService(repo, new IdentityService(repo), new StellarWalletProofVerifier());
  });
  afterAll(async () => { if (db?.isInitialized) await db.destroy(); if (admin?.isInitialized) { await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await admin.destroy(); } });
  const proof = (c: { challengeId: string; message: string; network: string }) => ({ challengeId: c.challengeId, network: c.network, publicKey: keys.publicKey(), signature: Buffer.from(keys.sign(createHash('sha256').update('Stellar Signed Message:\n').update(c.message).digest())).toString('base64') });
  it('consumes once concurrently and preserves ownership after restart', async () => {
    const c = await wallet.challenge(buyer), p = proof(c);
    const results = await Promise.allSettled([wallet.verify(buyer, p), wallet.verify(buyer, p)]);
    expect(results.filter(r => r.status === 'fulfilled'), JSON.stringify(results.map(r => r.status === 'rejected' ? JSON.stringify(r.reason.response ?? String(r.reason)) : 'ok'))).toHaveLength(1);
    expect(await new WalletBindingRepository(db).find(buyer.id)).toBe(keys.publicKey());
    const otherChallenge = await wallet.challenge(other);
    await expect(wallet.verify(other, proof(otherChallenge))).rejects.toMatchObject({ response: { code: 'WALLET_ALREADY_BOUND' } });
    expect(await wallet.revoke(buyer)).toEqual({ revoked: true });
    await expect(wallet.verify(other, proof(otherChallenge))).resolves.toMatchObject({ verified: true });
  });
  it('permits only one owner when distinct users bind concurrently', async () => {
    await wallet.revoke(buyer); await wallet.revoke(other);
    const [first, second] = await Promise.all([wallet.challenge(buyer), wallet.challenge(other)]);
    const results = await Promise.allSettled([wallet.verify(buyer, proof(first)), wallet.verify(other, proof(second))]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  });
  it('rejects incorrect signature, network and expired challenges', async () => {
    const c = await wallet.challenge(buyer), p = proof(c);
    await expect(wallet.verify(buyer, { ...p, signature: Buffer.alloc(64).toString('base64') })).rejects.toThrow();
    await expect(wallet.verify(buyer, { ...p, network: 'wrong' })).rejects.toThrow();
    await db.query("UPDATE wallet_challenges SET expires_at = now() - interval '1 second' WHERE id = $1", [c.challengeId]);
    await expect(wallet.verify(buyer, p)).rejects.toThrow();
  });
});
