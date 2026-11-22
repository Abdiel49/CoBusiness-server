import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordIdentity1763680000003 implements MigrationInterface {
  name = 'PasswordIdentity1763680000003';
  async up(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE app_users ALTER COLUMN google_subject DROP NOT NULL');
    await q.query('ALTER TABLE app_users ADD COLUMN password_hash text');
    await q.query('CREATE UNIQUE INDEX app_users_email_normalized ON app_users (lower(trim(email)))');
    await q.query('CREATE TABLE auth_attempts (key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL)');
    await q.query('DROP TABLE oidc_requests');
  }
  async down(_q: QueryRunner): Promise<void> {
    throw new Error('Password identity migration cannot be safely reversed without losing accounts');
  }
}
