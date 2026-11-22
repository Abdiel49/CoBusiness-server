import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { DataSource, type QueryRunner } from 'typeorm';
import { CreateIdentity1763680000002 } from '../../migrations/1763680000002-CreateIdentity.js';
import { PasswordIdentity1763680000003 } from '../../migrations/1763680000003-PasswordIdentity.js';
import { RealAuthService } from './real-auth.service.js';

describe.skipIf(process.env.RUN_POSTGRES_INTEGRATION !== 'true')('password identity with PostgreSQL', () => {
  let db: DataSource;
  let admin: DataSource;
  let service: RealAuthService;
  let schema: string;
  beforeAll(async () => {
    const options = { type: 'postgres' as const, host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'cobusiness', password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'cobusiness' };
    admin = new DataSource(options); await admin.initialize();
    schema = 'auth_test_' + randomUUID().replaceAll('-', '');
    await admin.query(`CREATE SCHEMA "${schema}"`);
    db = new DataSource({ ...options, extra: { max: 5, options: `-c search_path=${schema}` } });
    await db.initialize();
    const runner = { query: db.query.bind(db) } as unknown as QueryRunner;
    await new CreateIdentity1763680000002().up(runner);
    await new PasswordIdentity1763680000003().up(runner);
    service = new RealAuthService(db);
  });
  afterAll(async () => { if (db?.isInitialized) await db.destroy(); if (admin?.isInitialized) { await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await admin.destroy(); } });
  it('registers, authenticates across instances and revokes sessions', async () => {
    await service.register('Buyer@Example.com', 'correct horse battery staple');
    await expect(service.register('buyer@example.com', 'correct horse battery staple')).rejects.toThrow();
    await expect(service.login('buyer@example.com', 'wrong password')).rejects.toThrow();
    const token = await service.login('buyer@example.com', 'correct horse battery staple');
    expect((await new RealAuthService(db).authenticate(token))?.role).toBe('buyer');
    expect(await service.authenticate('demo:buyer-demo:buyer')).toBeNull();
    await service.revoke(token);
    expect(await service.authenticate(token)).toBeNull();
  });
  it('enforces registration uniqueness concurrently', async () => {
    const results = await Promise.allSettled([service.register('race@example.com', 'correct horse battery staple'), service.register('RACE@example.com', 'correct horse battery staple')]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });
});
